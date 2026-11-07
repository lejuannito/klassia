import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bassa from '../shared/bassa.js';

export function validateBassaRecordings(root, entries) {
 const files = new Set();
 for (const entry of entries) {
  if (entry.recordings === undefined) continue;
  assert.ok(Array.isArray(entry.recordings), 'Invalid Bassa recordings list: ' + entry.id);
  const forms = new Set();
  for (const recording of entry.recordings) {
   assert.ok(bassa.isPublishableRecording(entry, recording), 'Invalid Bassa recording metadata: ' + entry.id);
   assert.ok(!forms.has(recording.form), 'Duplicate Bassa recording for ' + entry.id + ' / ' + recording.form);
   assert.ok(!files.has(recording.src), 'Bassa recording file used twice: ' + recording.src);
   const file = path.join(root, recording.src);
   const stat = fs.lstatSync(file, { throwIfNoEntry: false });
   assert.ok(stat?.isFile() && stat.size > 0, 'Missing or empty Bassa recording: ' + recording.src);
   const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
   assert.equal(hash, recording.sha256, 'Bassa recording differs from the approved file: ' + recording.src);
   forms.add(recording.form);
   files.add(recording.src);
  }
 }

 for (const name of fs.readdirSync(path.join(root, 'assets'))) {
  if (/^(?:bassa-ba\d{3}-|ba\d{3}-\d{2}\.wav$)/i.test(name)) {
   assert.ok(files.has('assets/' + name), 'Bassa recording without a publishable record: ' + name);
  }
 }
}
