#!/usr/bin/env python3
"""Fixed recordings for the SIL reading lessons (lot 5b) and the CE1 dictations.

Synthesises with Piper the reading support of each reading lesson (SIL-U<n>-R1 to R4)
and of each English lesson from the francophone programme (SIL-U<n>-E1)
and every listening practice of SIL or CE1 (--grade ce1) that has no recording yet, then adds the "audio"
field next to the text in the lesson files. Same pipeline as docs/SUPPORTS_SONORES.md:
length factor 1.10, loudness normalised to -17 LUFS, MP3 mono 24 kHz 40 kbit/s.

The voice models are not part of the repository:
  python3 scripts/audio-sil.py --voices /path/to/models   # fr_FR-siwis-medium.onnx, en_GB-cori-medium.onnx
Requires the piper-tts package and FFmpeg with libmp3lame. Existing recordings are kept.
"""
import argparse, glob, io, json, os, re, subprocess, sys, tempfile, wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {'fr': 'fr_FR-siwis-medium.onnx', 'en': 'en_GB-cori-medium.onnx'}
LINE_GAP, ITEM_GAP = 0.8, 1.6  # seconds of silence between support lines / dictation items

# Isolated letters and graphemes that the phonemiser would spell instead of sounding out.
# The text shown to the child is unchanged; only what the voice reads is respelt.
SOUNDS = {'é': 'hé', 'É': 'hé', 'è': 'eh', 'È': 'eh', 'ê': 'eh', 'Ê': 'eh', 'am': 'an', 'em': 'en', 'man': 'mant'}

def spoken(text, lang):
    if lang != 'fr':
        return text
    return re.sub(r"(?<![\wÀ-ÿ])([\wÀ-ÿ]+)(?![\wÀ-ÿ])", lambda m: SOUNDS.get(m.group(1), m.group(1)), text)

def segments(text, kind):
    if kind == 'lecture':
        return [line.strip() for line in text.split('\n') if line.strip()]
    # Dictation: one item at a time, with time to write between items.
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+', text.strip()) if x.strip()]

FILES = {'sil': 'sil/data/sil-u*.json', 'ce1': 'ce1/data/unit*.json'}

def items(grade='sil'):
    for path in sorted(glob.glob(os.path.join(ROOT, FILES[grade]))):
        for lesson in json.load(open(path, encoding='utf-8'))['lessons']:
            lang = 'en' if lesson['domain'].startswith('English') else 'fr'
            base = lesson['id'].lower()
            support = lesson.get('support') or {}
            if grade == 'sil' and re.search(r'-(R|E)\d$', lesson['id']) and support.get('text') and not support.get('audio'):
                yield path, lesson['id'], 'text', support['text'], lang, 'lecture', f'{base}-lecture.mp3'
            for j, p in enumerate(lesson.get('practice') or []):
                if p.get('listen') and not p.get('audio'):
                    yield path, lesson['id'], 'listen', p['listen'], lang, 'ecoute', f'{base}-ecoute-{j + 2}.mp3'

def synthesise(voice, config, parts, gap):
    frames, params = [], None
    for k, part in enumerate(parts):
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as w:
            voice.synthesize_wav(part, w, syn_config=config)
        buffer.seek(0)
        with wave.open(buffer, 'rb') as r:
            params = r.getparams()
            if k:
                frames.append(b'\0' * int(params.framerate * gap) * params.sampwidth * params.nchannels)
            frames.append(r.readframes(r.getnframes()))
    return params, b''.join(frames)

def encode(params, pcm, out):
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        with wave.open(tmp.name, 'wb') as w:
            w.setparams(params)
            w.writeframes(pcm)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp.name, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11',
                        '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '40k', out], check=True)

def add_audio(path, lesson_id, key, text, src):
    """Insert "audio" next to the text or listening message, keeping the file's layout."""
    t = open(path, encoding='utf-8').read()
    start = t.index(f'"id": "{lesson_id}"')
    nxt = re.compile(r'\n *\{\n *"id": ').search(t, start)
    end = nxt.start() if nxt else len(t)
    needle = f'"{key}": ' + json.dumps(text, ensure_ascii=False)
    at = t.index(needle, start, end)
    line_start = t.rindex('\n', 0, at) + 1
    indent = t[line_start:at]
    line_end = t.index('\n', at)
    line = t[line_start:line_end]
    entry = f'{indent}"audio": "../assets/{src}"'
    if line.endswith(','):
        t = t[:line_end] + '\n' + entry + ',' + t[line_end:]
    else:
        t = t[:line_end] + ',\n' + entry + t[line_end:]
    json.loads(t)
    open(path, 'w', encoding='utf-8').write(t)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--voices', required=True, help='folder with the Piper models and their .json files')
    parser.add_argument('--dry-run', action='store_true', help='list what would be read, without synthesis')
    parser.add_argument('--grade', default='sil', choices=sorted(FILES), help='class whose lesson files are read')
    parser.add_argument('--match', default='', help='only the recordings whose file name matches this regular expression')
    args = parser.parse_args()
    todo = [x for x in items(args.grade) if re.search(args.match, x[-1])]
    if args.dry_run:
        for path, lid, key, text, lang, kind, src in todo:
            print(src, '|', ' / '.join(spoken(s, lang) for s in segments(text, kind)))
        return
    from piper import PiperVoice, SynthesisConfig
    voices = {lang: PiperVoice.load(os.path.join(args.voices, name)) for lang, name in VOICES.items()}
    config = SynthesisConfig(length_scale=1.10)
    for path, lid, key, text, lang, kind, src in todo:
        out = os.path.join(ROOT, 'assets', src)
        parts = [spoken(s, lang) for s in segments(text, kind)]
        params, pcm = synthesise(voices[lang], config, parts, LINE_GAP if kind == 'lecture' else ITEM_GAP)
        encode(params, pcm, out)
        add_audio(path, lid, key, text, src)
        print(f'{src}  {os.path.getsize(out)} octets')
    print(f'{len(todo)} enregistrements', file=sys.stderr)

if __name__ == '__main__':
    main()
