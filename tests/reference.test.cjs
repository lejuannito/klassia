const assert = require('node:assert/strict');
const { test } = require('node:test');
const { numberInWords, parseNumber } = require('../shared/reference.js');

test('French cardinal spelling keeps the required hyphens and agreements', () => {
 for (const [value, expected] of [
  [0, 'zéro'], [71, 'soixante et onze'], [80, 'quatre-vingts'], [81, 'quatre-vingt-un'],
  [2000, 'deux mille'], [2075, 'deux mille soixante-quinze'], [2200, 'deux mille deux cents'],
  [2201, 'deux mille deux cent un'], [2480, 'deux mille quatre cent quatre-vingts'],
  [9081, 'neuf mille quatre-vingt-un'], [10000, 'dix mille'], [80000, 'quatre-vingt mille'],
  [99999, 'quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf']
 ]) assert.equal(numberInWords(value), expected, String(value));
 assert.throws(() => numberInWords(100000), RangeError);
});

test('reference fields accept grouped integers within their range', () => {
 for (const input of ['4081', '4 081', '4\u00a0081', ' 4\u202f081 ']) assert.equal(parseNumber(input, 10000), 4081);
 for (const input of ['4 08', '4.081', '-2000', '3,50', '10 001', '9e3', '']) assert.equal(parseNumber(input, 10000), null);
 assert.equal(parseNumber('34 527', 99999), 34527);
});
