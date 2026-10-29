import assert from 'node:assert/strict';
import {novoHardware,comprarPecaPC,iniciarPC,atualizarPC,importarHardware,COMPONENTES_PC} from '../js/informatica.js';
const e=novoHardware(); assert.ok(iniciarPC(e)); e.bancada=true;
assert.equal(comprarPecaPC(e,'cpu',()=>false),false);
for(const k of Object.keys(COMPONENTES_PC)) assert.equal(comprarPecaPC(e,k,()=>true),true);
assert.equal(iniciarPC(e),null); assert.ok(iniciarPC(e));
assert.equal(atualizarPC(e,10),false);
const volta=importarHardware(JSON.parse(JSON.stringify(e))); assert.equal(volta.restantes,20);
assert.equal(atualizarPC(volta,20),true); assert.equal(volta.prontos,1);
assert.equal(atualizarPC(volta,20),false); assert.equal(volta.prontos,1);
console.log('PASS: PC exige bancada e seis peças, consome componentes e retoma montagem pelo save');

