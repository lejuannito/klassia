const test=require('node:test'),assert=require('node:assert/strict');
const {selectVoice}=require('../shared/speech.js');
const en={name:'Default English',lang:'en-US',default:true,localService:true};
const fr={name:'Français',lang:'fr-FR',default:false,localService:true};
test('French never uses the English device default',()=>{assert.equal(selectVoice([en,fr],'fr-FR'),fr);assert.equal(selectVoice([en],'fr-FR'),null);assert.equal(selectVoice([],'fr-FR'),null);});
test('regional fallback remains in requested language and exact locale takes priority',()=>{const ca={name:'Canada',lang:'fr_CA',localService:true};assert.equal(selectVoice([en,ca],'fr-FR'),ca);assert.equal(selectVoice([en,ca,fr],'fr-FR'),fr);assert.equal(selectVoice([fr,en],'en-GB'),en);});
test('local voice is preferred among matching locales without mutating the voice list',()=>{const remote={...fr,localService:false,default:true},voices=[remote,fr];assert.equal(selectVoice(voices,'fr-FR'),fr);assert.equal(voices[0],remote);assert.equal(selectVoice([en,fr],'bas'),null);});
