// Testes do controle: zona morta, gatilhos, borda do botão e mapeamento.
// Rodar na pasta do projeto: node testes/entrada.test.mjs
import assert from 'node:assert/strict';
import { BOTOES, ZONA_MORTA, analogico, lerControle, primeiroControle } from '../js/entrada.js';

function controle({ eixos = [0, 0, 0, 0], apertar = [], gatilhos = {} } = {}) {
  const buttons = Array.from({ length: 17 }, (_, i) => ({ pressed: apertar.includes(i), value: apertar.includes(i) ? 1 : 0 }));
  for (const [i, v] of Object.entries(gatilhos)) buttons[i] = { pressed: v > 0.1, value: v };
  return { connected: true, axes: eixos, buttons };
}

let ok = 0;
const teste = (nome, fn) => { fn(); ok += 1; console.log(`PASS: ${nome}`); };

teste('zona morta ignora analógico parado ou levemente torto', () => {
  assert.deepEqual(analogico(0.1, -0.1), { x: 0, y: 0 });
  const cheio = analogico(1, 0);
  assert.ok(Math.abs(cheio.x - 1) < 1e-9);
  const meio = analogico(0.6, 0);
  assert.ok(meio.x > 0 && meio.x < 0.6, 'reescala depois da zona morta');
  const d = analogico(1, 1);
  assert.ok(Math.abs(Math.hypot(d.x, d.y) - 1) < 1e-9, 'diagonal cheia não passa de 1');
});

teste('analógicos viram movimento e câmera', () => {
  const r = lerControle(controle({ eixos: [0, -1, 0.9, 0] }));
  assert.equal(r.mover.y, -1);
  assert.ok(r.camera.x > 0.8);
  assert.equal(r.ativo, true);
});

teste('botão gera ação só no quadro em que desce', () => {
  const primeiro = lerControle(controle({ apertar: [0] }));
  assert.deepEqual(primeiro.acoes, ['KeyE']);
  const segurando = lerControle(controle({ apertar: [0] }), primeiro.apertados);
  assert.deepEqual(segurando.acoes, []);
  const soltou = lerControle(controle(), segurando.apertados);
  const denovo = lerControle(controle({ apertar: [0] }), soltou.apertados);
  assert.deepEqual(denovo.acoes, ['KeyE']);
});

teste('gatilhos contam a partir da metade', () => {
  assert.deepEqual(lerControle(controle({ gatilhos: { 6: 0.3 } })).acoes, []);
  assert.deepEqual(lerControle(controle({ gatilhos: { 6: 0.8, 7: 1 } })).acoes, ['KeyU', 'KeyL']);
});

teste('mapeamento Xbox: A, B, X, Y, ombros, direcional e Menu', () => {
  assert.equal(BOTOES[0], 'KeyE');
  assert.equal(BOTOES[1], 'KeyR');
  assert.equal(BOTOES[2], 'KeyV');
  assert.equal(BOTOES[3], 'KeyB');
  assert.equal(BOTOES[4], 'KeyK');
  assert.equal(BOTOES[5], 'KeyI');
  assert.equal(BOTOES[9], 'Menu');
  assert.deepEqual(lerControle(controle({ apertar: [12, 13, 14, 15] })).acoes, ['KeyT', 'Digit1', 'KeyC', 'KeyM']);
});

teste('controle desconectado ou ausente não faz nada', () => {
  assert.equal(lerControle(null).ativo, false);
  assert.equal(lerControle({ connected: false, axes: [1, 1], buttons: [] }).ativo, false);
  assert.equal(primeiroControle([null, { connected: false }]), null);
  const g = { connected: true };
  assert.equal(primeiroControle([null, g]), g);
  assert.ok(ZONA_MORTA > 0 && ZONA_MORTA < 0.3);
});

console.log(`\n${ok} testes passaram.`);
