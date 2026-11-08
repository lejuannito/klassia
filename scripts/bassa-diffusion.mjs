import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import bassa from '../shared/bassa.js';
import { validateBassaRecordings } from './validate-bassa-recordings.mjs';

const root = path.resolve(import.meta.dirname, '..');
const lexiconPath = path.join(root, 'data/bassa-lexicon-variants.json');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceFormats = new Map([
 ['audio/webm', 'matroska'], ['video/webm', 'matroska'], ['audio/ogg', 'ogg'],
 ['audio/mp4', 'mov'], ['video/mp4', 'mov'], ['audio/wav', 'wav'], ['audio/mpeg', 'mp3']
]);
const sourceLimit = 4 * 1024 * 1024;

function readLimited(file, maximum) {
 const stat = fs.statSync(file);
 if (!stat.isFile() || stat.size > maximum) throw Error('Fichier absent ou trop volumineux : ' + path.basename(file));
 return fs.readFileSync(file);
}

function readDossier(file, entries) {
 const data = JSON.parse(readLimited(file, 6 * 1024 * 1024));
 if (data?.format !== 'klassia-bassa-publication' || data.version !== 1) throw Error('Dossier Klassia invalide.');
 const entry = entries.find(item => item.id === data.id);
 const { form, sense, reviewed_on, review_ref, consent_ref, credit } = data;
 const metadata = { form, sense, reviewed_on, review_ref, consent_ref, ...(credit ? { credit } : {}) };
 const probe = { ...metadata, src: 'assets/bassa-' + entry?.id.toLowerCase() + '-01.mp3', sha256: '0'.repeat(64) };
 if (!entry || !bassa.isPublishableRecording(entry, probe) || sense.length > 160 ||
     review_ref.length > 64 || consent_ref.length > 64 || (credit && credit.length > 100)) {
  throw Error('Vérifiez l’entrée, la forme, l’avis favorable et l’accord de diffusion.');
 }
 const demuxer = sourceFormats.get(data.source?.type?.split(';')[0]?.toLowerCase());
 const encoded = data.source?.base64;
 if (!demuxer || typeof encoded !== 'string') throw Error('Format de prise source inconnu.');
 const audio = Buffer.from(encoded, 'base64');
 if (!audio.length || audio.length > sourceLimit || audio.toString('base64') !== encoded) {
  throw Error('Source audio vide, endommagée ou trop volumineuse.');
 }
 return { entry, metadata, audio, demuxer };
}

function encode({ audio, demuxer }) {
 const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'klassia-bassa-'));
 try {
  const source = path.join(folder, 'prise');
  fs.writeFileSync(source, audio);
  const result = spawnSync('ffmpeg', [
   '-nostdin', '-hide_banner', '-loglevel', 'error', '-protocol_whitelist', 'file,pipe',
   '-f', demuxer, '-i', source, '-map', '0:a:0', '-map_metadata', '-1', '-map_chapters', '-1',
   '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', '-write_id3v2', '0',
   '-f', 'mp3', 'pipe:1'
  ], { timeout: 20_000, maxBuffer: 256 * 1024 });
  if (result.error?.code === 'ENOENT') throw Error('Installez FFmpeg avec libmp3lame pour encoder la prise.');
  if (result.error || result.status !== 0 || !result.stdout.length) throw Error('La prise audio ne peut pas être encodée.');
  return result.stdout;
 } finally {
  fs.rmSync(folder, { recursive: true, force: true });
 }
}

function integrate(dossierPath, candidatePath, approvedHash) {
 const mp3 = readLimited(candidatePath, 256 * 1024);
 if (!/^[a-f0-9]{64}$/.test(approvedHash || '') || digest(mp3) !== approvedHash) {
  throw Error('Le MP3 doit correspondre à l’empreinte de la prise réécoutée et approuvée.');
 }
 const lock = path.join(root, 'data/.bassa-diffusion');
 fs.mkdirSync(lock);
 try {
  const lexicon = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
  validateBassaRecordings(root, lexicon.entries);
  const dossier = readDossier(dossierPath, lexicon.entries);
  if (!encode(dossier).equals(mp3)) throw Error('Repréparez le MP3 à partir de ce dossier avec cette version de FFmpeg.');
  const { entry, metadata } = dossier;
  entry.recordings ??= [];
  const existing = entry.recordings.find(item => item.form === metadata.form);
  if (existing) {
   if (existing.sha256 === approvedHash && Object.entries(metadata).every(([key, value]) => existing[key] === value)) {
    console.log('Prise déjà intégrée : ' + existing.src);
    return;
   }
   throw Error('Une prise est déjà publiée pour cette forme. La remplacer demande une revue distincte.');
  }
  const used = new Set(entry.recordings.map(item => item.src));
  const suffix = Array.from({ length: 99 }, (_, i) => String(i + 1).padStart(2, '0'))
   .find(n => !used.has(`assets/bassa-${entry.id.toLowerCase()}-${n}.mp3`));
  if (!suffix) throw Error('Aucun numéro de prise disponible pour ' + entry.id);
  const src = `assets/bassa-${entry.id.toLowerCase()}-${suffix}.mp3`;
  const asset = path.join(root, src);
  entry.recordings.push({ ...metadata, src, sha256: approvedHash });
  fs.writeFileSync(asset, mp3, { flag: 'wx' });
  try {
   validateBassaRecordings(root, lexicon.entries);
   const pending = path.join(lock, 'lexique.json');
   fs.writeFileSync(pending, JSON.stringify(lexicon, null, 2) + '\n');
   fs.renameSync(pending, lexiconPath);
  } catch (error) {
   fs.unlinkSync(asset);
   throw error;
  }
  console.log('Prise intégrée : ' + src + '. Exécutez npm run validate et npm run build.');
 } finally {
  fs.rmSync(lock, { recursive: true });
 }
}

try {
 const [action, dossier, mp3, hash, ...extra] = process.argv.slice(2);
 if (!dossier || !mp3 || !mp3.toLowerCase().endsWith('.mp3') || extra.length) throw Error('Arguments invalides.');
 if (action === 'preparer' && !hash) {
  const lexicon = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
  const bytes = encode(readDossier(dossier, lexicon.entries));
  fs.writeFileSync(mp3, bytes, { flag: 'wx' });
  console.log('MP3 à réécouter. Empreinte SHA-256 : ' + digest(bytes));
 } else if (action === 'integrer' && hash) integrate(dossier, mp3, hash);
 else throw Error('Commande inconnue.');
} catch (error) {
 console.error(error.message);
 console.error('npm run bassa:diffusion -- preparer DOSSIER.json CANDIDAT.mp3');
 console.error('npm run bassa:diffusion -- integrer DOSSIER.json CANDIDAT.mp3 EMPREINTE_APPROUVÉE');
 process.exitCode = 1;
}
