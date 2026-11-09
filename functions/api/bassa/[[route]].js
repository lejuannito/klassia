/* Klassia Bassa shared audio on Cloudflare Pages Functions.
   Public: catalog and approved audio. Protected: /author* behind Cloudflare Access.
   Pages bindings: AUDIO_DB (D1), AUDIO_MEDIA (private R2).
*/
const error = (message, status = 400) => Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
const validRef = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(value);
const validId = value => typeof value === 'string' && /^[0-9a-f-]{36}$/.test(value);
const mediaTypes = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'video/webm', 'video/mp4']);

function allowOrigin(request) {
 const origin = request.headers.get('Origin');
 return origin === 'https://lejuannito.github.io' || origin === 'https://klassia.app' ? origin : null;
}
function publicHeaders(request) {
 const headers = new Headers({ 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' });
 const origin = allowOrigin(request);
 if (origin) headers.set('Access-Control-Allow-Origin', origin);
 return headers;
}
function decodeBase64Url(value) {
 const padded = value.replace(/-/g, '+').replace(/_/g, '/');
 const binary = atob(padded + '='.repeat((4 - padded.length % 4) % 4));
 return Uint8Array.from(binary, char => char.charCodeAt(0));
}
function decodedJson(value) { return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))); }

async function authenticate(request, env) {
 // Access is mandatory at the edge and is also independently verified here.
 const token = request.headers.get('Cf-Access-Jwt-Assertion');
 const issuer = String(env.ACCESS_ISSUER || '');
 const audience = String(env.ACCESS_AUD || '');
 const emails = String(env.AUDIO_PUBLISHERS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
 if (!token || !audience || !emails.length || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)) return null;
 const pieces = token.split('.');
 if (pieces.length !== 3) return null;
 try {
  const header = decodedJson(pieces[0]), payload = decodedJson(pieces[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null;
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== issuer || !Array.isArray(payload.aud) || !payload.aud.includes(audience)
   || typeof payload.exp !== 'number' || payload.exp <= now || (payload.nbf && payload.nbf > now)) return null;
  const email = String(payload.email || '').toLowerCase();
  if (!emails.includes(email)) return null;
  const response = await fetch(issuer + '/cdn-cgi/access/certs');
  if (!response.ok) return null;
  const { keys } = await response.json();
  const key = keys?.find(item => item.kid === header.kid && item.kty === 'RSA');
  if (!key) return null;
  const imported = await crypto.subtle.importKey('jwk', key,
   { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const signature = decodeBase64Url(pieces[2]);
  const input = new TextEncoder().encode(pieces[0] + '.' + pieces[1]);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', imported, signature, input)) return null;
  return email;
 } catch { return null; }
}

async function checkLexicon(env, request, entryId, form) {
 const url = new URL('/data/bassa-lexicon-variants.json', request.url);
 const response = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
 if (!response.ok) throw Error('Lexique indisponible');
 const data = await response.json();
 return data.entries?.some(entry => entry.id === entryId && entry.forms?.includes(form));
}

export async function onRequest({ request, env, params }) {
 const segments = Array.isArray(params.route) ? params.route : [params.route];
 const route = segments.filter(Boolean);
 const [action, id] = route;
 if (!env.AUDIO_DB || !env.AUDIO_MEDIA) return error('Stockage partagé non configuré', 503);
 if (request.method === 'GET' && action === 'catalog' && !id) {
  const result = await env.AUDIO_DB.prepare(
   "SELECT id, entry_id, form, sense, credit FROM bassa_audio WHERE status = 'published' ORDER BY published_at DESC LIMIT 300"
  ).all();
  return Response.json({ recordings: result.results || [] }, { headers: publicHeaders(request) });
 }
 if (request.method === 'GET' && action === 'audio' && validId(id) && route.length === 2) {
  const record = await env.AUDIO_DB.prepare(
   "SELECT mime FROM bassa_audio WHERE id = ? AND status = 'published'"
  ).bind(id).first();
  if (!record) return error('Enregistrement indisponible', 404);
  const media = await env.AUDIO_MEDIA.get('bassa/' + id);
  if (!media) return error('Enregistrement indisponible', 404);
  const headers = publicHeaders(request);
  headers.set('Content-Type', record.mime);
  headers.set('Content-Length', String(media.size));
  headers.set('Accept-Ranges', 'none');
  return new Response(media.body, { headers });
 }
 if (action !== 'author') return error('Route inconnue', 404);
 const email = await authenticate(request, env);
 if (!email) return error('Authentification du référent requise', 403);
 if (request.method === 'GET' && route.length === 1) {
  const result = await env.AUDIO_DB.prepare(
   "SELECT id, entry_id, form, sense, published_at FROM bassa_audio WHERE status='published' ORDER BY published_at DESC LIMIT 100"
  ).all();
  return Response.json({ authorized: true, recordings: result.results || [] },
   { headers: { 'Cache-Control': 'no-store' } });
 }
 if (request.method === 'POST' && route.length === 1) {
  if (Number(request.headers.get('Content-Length')) > 2_500_000) return error('Fichier trop volumineux', 413);
  const body = await request.formData().catch(() => null);
  const file = body?.get('audio');
  const entryId = String(body?.get('entry_id') || '');
  const form = String(body?.get('form') || '');
  const sense = String(body?.get('sense') || '').trim();
  const reviewRef = String(body?.get('review_ref') || '');
  const consentRef = String(body?.get('consent_ref') || '');
  const credit = String(body?.get('credit') || '').trim();
  const mime = String(file?.type || '').split(';')[0];
  if (!/^BA\d{3}$/.test(entryId) || !form || form.length > 120
   || !sense || sense.length > 160 || !validRef(reviewRef) || !validRef(consentRef)
   || credit.length > 100 || body?.get('confirmed') !== 'true'
   || !file || !mediaTypes.has(mime) || !file.size || file.size > 2_000_000) {
   return error('Prise ou justificatifs invalides');
  }
  try {
   if (!await checkLexicon(env, request, entryId, form)) return error('Forme absente du lexique', 422);
  } catch { return error('Impossible de vérifier le lexique', 503); }
  const id = crypto.randomUUID();
  const bytes = await file.arrayBuffer();
  await env.AUDIO_MEDIA.put('bassa/' + id, bytes, { httpMetadata: { contentType: mime } });
  try {
   await env.AUDIO_DB.prepare(
    "INSERT INTO bassa_audio (id, entry_id, form, sense, mime, size_bytes, credit, review_ref, consent_ref, published_by, published_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'published')"
   ).bind(id, entryId, form, sense, mime, file.size, credit, reviewRef, consentRef, email).run();
  } catch {
   await env.AUDIO_MEDIA.delete('bassa/' + id);
   return error('Publication non enregistrée', 500);
  }
  return Response.json({ published: true, id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
 }
 if (request.method === 'DELETE' && route.length === 2 && validId(id)) {
  const result = await env.AUDIO_DB.prepare(
   "UPDATE bassa_audio SET status='withdrawn' WHERE id=? AND status='published'"
  ).bind(id).run();
  if (!result.meta?.changes) return error('Enregistrement introuvable', 404);
  await env.AUDIO_MEDIA.delete('bassa/' + id);
  return Response.json({ withdrawn: true }, { headers: { 'Cache-Control': 'no-store' } });
 }
 return error('Méthode inconnue', 405);
}
