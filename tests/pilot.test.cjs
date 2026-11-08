const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRecord, readExport, additions, summarize, summarizeDevices } = require('../shared/pilot.js');

const observation = (id, changes = {}) => normalizeRecord({
  id: id.repeat(32), kind: 'observation', session: 'fam-01', edition: 'ABC12345',
  day: '2026-11-07', note: 'Lit la graduation d’arrivée.', actor: 'famille',
  grade: 'CE1', lesson: 'ce1-u1-l11', exercise: '1', help: 'guidage',
  cause: 'consigne', retry: 'autonome', suggestion: '', ...changes
});

const deviceResults = Object.fromEntries(['installation', 'bassa', 'micro', 'extraits', 'voix', 'progression']
  .map(key => [key, 'non-essaye']));
const deviceReport = (id, changes = {}) => normalizeRecord({
  id: id.repeat(32), kind: 'appareil', session: 'TEL-01', edition: 'ABC12345',
  day: '2026-11-07', platform: 'Android', device: 'Android Chrome', address: 'https://example.test/',
  opening: 'icone', network: 'avion', note: '', ...changes,
  results: { ...deviceResults, ...(changes.results ?? { micro: 'reussi' }) }
});

test('pilot imports deduplicate matching reports and reject conflicts before saving', () => {
  const report = observation('a');
  const payload = { format: 'klassia-pilot', version: 1, records: [report, report] };
  assert.equal(report.session, 'FAM-01');
  assert.equal(report.lesson, 'CE1-U1-L11');
  assert.deepEqual(additions([], readExport(payload)), [report]);
  assert.deepEqual(additions([report], readExport(payload)), []);
  assert.throws(() => additions([report], [observation('a', { note: 'Other note' })]), /même identifiant/);
  assert.throws(() => readExport({ ...payload, records: [{ ...report, help: 'unknown' }] }), /Aide/);
  assert.throws(() => readExport({ ...payload, records: [{ ...report, suggestion: 'a'.repeat(301) }] }), /Proposition/);
});

test('pilot summary counts distinct sessions per edition and leaves out technical reports', () => {
  const results = summarize([
    observation('a'), observation('b', { help: 'bloque' }),
    observation('c', { session: 'ENS-02', actor: 'enseignant', help: 'bloque' }),
    observation('d', { session: 'TEL-01', cause: 'technique' }),
    observation('e', { session: 'ENS-02', edition: 'new-edition', help: 'autonome' })
  ]);
  assert.deepEqual(results.map(group => [group.edition, group.sessions, group.help]),
    [['abc12345', 2, 2], ['new-edition', 1, 0]]);
});

test('pilot device reports require an observed outcome and preserve untried checks', () => {
  assert.throws(() => deviceReport('f', { results: deviceResults }), /au moins un contrôle/);
  const report = deviceReport('f', { results: { micro: 'a-reprendre' } });
  assert.equal(report.results.micro, 'a-reprendre');
  assert.equal(report.results.voix, 'non-essaye');
  assert.equal(report.results.impression, 'non-essaye');
  assert.equal(report.results.corriges, 'non-essaye');
  assert.equal(report.results.prises_bassa, 'non-essaye');
  const legacy = { ...report, results: { ...deviceResults, micro: 'a-reprendre' } };
  assert.deepEqual(additions([legacy], [report]), []);
  const withPrint = deviceReport('e', { results: { impression: 'reussi', corriges: 'a-reprendre' } });
  assert.equal(withPrint.results.impression, 'reussi');
  assert.equal(withPrint.results.corriges, 'a-reprendre');
  assert.deepEqual(summarize([report]), []);
});

test('pilot phone coverage separates edition, site, launch mode and network and preserves mixed results', () => {
  const groups = summarizeDevices([
    observation('9'),
    deviceReport('a'), deviceReport('b'),
    deviceReport('c', { session: 'TEL-02', results: { micro: 'a-reprendre' } }),
    deviceReport('d', { session: 'TEL-03', platform: 'iPhone', results: { prises_bassa: 'reussi' } }),
    deviceReport('e', { opening: 'onglet' }),
    deviceReport('f', { network: 'en-ligne' }),
    deviceReport('0', { address: 'https://other.test/' }),
    deviceReport('1', { edition: 'abc12344' })
  ]);
  assert.equal(groups.length, 5);
  const main = groups.find(group => group.edition === 'abc12345' && group.address === 'https://example.test/' &&
    group.opening === 'icone' && group.network === 'avion');
  assert.deepEqual([...main.Android.micro.reussi], ['TEL-01']);
  assert.deepEqual([...main.Android.micro['a-reprendre']], ['TEL-02']);
  assert.deepEqual([...main.iPhone.prises_bassa.reussi], ['TEL-03']);
  assert.equal(main.iPhone.micro, undefined);
  assert.equal(main.Android.prises_bassa, undefined);
});
