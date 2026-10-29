import assert from 'node:assert/strict';
import { limiteEquipe } from '../js/construcao.js';
assert.equal(limiteEquipe({ nivel: 0 }), 3);
assert.equal(limiteEquipe({ nivel: 1 }), 6);
assert.equal(limiteEquipe({ nivel: 2 }), 10);
assert.equal(limiteEquipe({ nivel: 3 }), 10);
import { exportarConstrucao, importarConstrucao, melhorar, novaConstrucao, proximaMelhoria, temEscritorio, temFachada, temTerreno } from '../js/construcao.js';
import { cabeAqui, definirTerrenoExpandido } from '../js/grade.js';

let dinheiro = 700;
const pagar = (valor) => dinheiro >= valor && ((dinheiro -= valor) >= 0);
const estado = novaConstrucao();
assert.equal(proximaMelhoria(estado).id, 'terreno');
assert.equal(melhorar(estado, pagar).melhoria.id, 'terreno');
assert.ok(temTerreno(estado));
assert.equal(melhorar(estado, pagar).melhoria.id, 'escritorio');
assert.ok(temEscritorio(estado));
assert.equal(melhorar(estado, pagar).melhoria.id, 'fachada');
assert.ok(temFachada(estado));
assert.ok(melhorar(estado, pagar).erro);
assert.deepEqual(importarConstrucao(exportarConstrucao(estado)), estado);
assert.deepEqual(importarConstrucao({ nivel: 99 }), { nivel: 3 });
assert.equal(cabeAqui(15, 5), false, 'lote vizinho começa bloqueado');
definirTerrenoExpandido(true);
assert.equal(cabeAqui(15, 5), true, 'compra libera células do lote vizinho');
console.log('PASS: terreno, escritório e fachada evoluem em ordem, cobram e salvam');
console.log('\n1 teste passou.');

