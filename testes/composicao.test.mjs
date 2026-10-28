// Testes da partitura: forma, tamanhos, notas dentro do compasso e da tessitura.
// Rodar na pasta do projeto: node testes/composicao.test.mjs
import assert from 'node:assert/strict';
import { BAIXO, BATERIA, PIANO, TOTAL_COMPASSOS, compasso, frequencia, midi, DURACAO_PASSO } from '../js/audio/composicao.js';

assert.equal(midi('A4'), 69);
assert.equal(midi('C4'), 60);
assert.equal(midi('Bb1'), 34);
assert.ok(Math.abs(frequencia(69) - 440) < 1e-9);
console.log('PASS: conversão de notas');

assert.equal(TOTAL_COMPASSOS, 48);
const duracao = TOTAL_COMPASSOS * 16 * DURACAO_PASSO;
assert.ok(duracao > 110 && duracao < 120, `duração ${duracao}`);
console.log(`PASS: forma com ${TOTAL_COMPASSOS} compassos (${duracao.toFixed(1)} s antes de repetir)`);

for (let i = 0; i < TOTAL_COMPASSOS; i++) {
  const c = compasso(i);
  assert.equal(c.vozes.length, 4);
  assert.ok(c.baixo >= midi('E1') && c.baixo <= midi('D2'), `baixo fora da região no compasso ${i}`);
  for (const n of c.melodia) {
    assert.ok(n.passo >= 0 && n.passo < 16 && n.passo + n.dur <= 16, `nota passa do compasso ${i}`);
    assert.ok(n.nota >= midi('C5') && n.nota <= midi('G6'), `melodia fora da tessitura no compasso ${i}`);
  }
  // Notas da melodia não se sobrepõem dentro do compasso.
  for (let k = 1; k < c.melodia.length; k++) assert.ok(c.melodia[k].passo >= c.melodia[k - 1].passo + c.melodia[k - 1].dur, `sobreposição no compasso ${i}`);
}
console.log('PASS: 48 compassos com melodia dentro do compasso e da tessitura, baixo na região grave');

for (const lev of Object.values(BATERIA)) for (const passos of Object.values(lev)) assert.ok(passos.every((p) => p >= 0 && p < 16));
for (const r of Object.values(PIANO)) assert.ok(r.every(([p, d]) => p + d <= 16));
assert.ok(BAIXO.every(([p, , d]) => p + d <= 16));
assert.equal(compasso(39).acorde, 'A7', 'seção C resolve em A7 antes de voltar à B');
assert.deepEqual(compasso(48), compasso(0), 'a forma repete');
console.log('PASS: levadas de bateria, piano e baixo dentro do compasso; resolução e repetição da forma');
console.log('\n4 testes passaram.');
