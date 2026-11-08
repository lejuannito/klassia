(function () {
 'use strict';
 const small = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
 const tens = { 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante' };

 function belowHundred(number, terminal) {
  if (number < small.length) return small[number];
  if (number < 20) return 'dix-' + small[number - 10];
  if (number >= 80) {
   if (number === 80) return terminal ? 'quatre-vingts' : 'quatre-vingt';
   return 'quatre-vingt-' + belowHundred(number - 80, terminal);
  }
  const group = number >= 70 ? 60 : Math.floor(number / 10) * 10;
  const rest = number - group;
  if (!rest) return tens[group];
  return tens[group] + ([1, 11].includes(rest) ? ' et ' : '-') + belowHundred(rest, terminal);
 }

 function belowThousand(number) {
  if (number < 100) return belowHundred(number, true);
  const hundreds = Math.floor(number / 100);
  const rest = number % 100;
  const label = (hundreds === 1 ? '' : small[hundreds] + ' ') + 'cent';
  return rest ? label + ' ' + belowHundred(rest, true) : label + (hundreds > 1 ? 's' : '');
 }

 function numberInWords(number) {
  if (!Number.isInteger(number) || number < 0 || number > 99999) throw RangeError('Nombre hors plage');
  if (number < 1000) return belowThousand(number);
  const thousands = Math.floor(number / 1000);
  const rest = number % 1000;
  const label = (thousands === 1 ? '' : belowHundred(thousands, false) + ' ') + 'mille';
  return rest ? label + ' ' + belowThousand(rest) : label;
 }

 function parseNumber(value, max) {
  const digits = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)$/.test(digits)) return null;
  const number = Number(digits.replace(/\s/g, ''));
  return number <= max ? number : null;
 }

 if (typeof module === 'object' && module.exports) {
  module.exports = { numberInWords, parseNumber };
  return;
 }

 const alphabet = document.getElementById('alphabetLetters');
 for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  const item = document.createElement('li');
  item.textContent = letter + ' ' + letter.toLowerCase();
  alphabet.append(item);
 }

 const factor = document.getElementById('tableFactor');
 const table = document.getElementById('multiplicationTable');
 for (let index = 1; index <= 10; index++) factor.add(new Option(index, index));
 function showTable() {
  const selected = Number(factor.value);
  table.caption.textContent = 'Table de ' + selected;
  table.tBodies[0].replaceChildren();
  for (let index = 1; index <= 10; index++) {
   const row = table.tBodies[0].insertRow();
   row.insertCell().textContent = selected + ' × ' + index;
   row.insertCell().textContent = selected * index;
  }
 }
 factor.addEventListener('change', showTable);
 showTable();

 const format = new Intl.NumberFormat('fr-FR');
 for (const form of document.querySelectorAll('[data-number-form]')) {
  const currency = form.hasAttribute('data-currency');
  const limit = currency ? 10000 : 99999;
  const section = form.parentElement;
  const result = section.querySelector('[data-number-result]');
  const breakdown = section.querySelector('[data-number-breakdown]');
  function showNumber() {
   const number = parseNumber(form.elements.amount.value, limit);
   if (number === null) {
    result.textContent = 'Saisis un entier de 0 à ' + format.format(limit) + '.';
    breakdown.textContent = '';
    return;
   }
   const unit = currency ? (number > 1 ? ' francs CFA' : ' franc CFA') : '';
   result.textContent = numberInWords(number) + unit;
   const values = [10000, 1000, 100, 10, 1].map(place => Math.floor(number / place) % 10 * place).filter(Boolean);
   breakdown.textContent = format.format(number) + ' = ' + (values.length ? values.map(value => format.format(value)).join(' + ') : '0');
  }
  form.addEventListener('submit', event => { event.preventDefault(); showNumber(); });
  showNumber();
 }

 const links = [...document.querySelectorAll('nav a')];
 function showSection() {
  const active = links.find(link => link.hash === location.hash) || links[0];
  for (const link of links) {
   const selected = link === active;
   document.getElementById(link.hash.slice(1)).hidden = !selected;
   if (selected) link.setAttribute('aria-current', 'page');
   else link.removeAttribute('aria-current');
  }
 }
 window.addEventListener('hashchange', showSection);
 showSection();
})();
