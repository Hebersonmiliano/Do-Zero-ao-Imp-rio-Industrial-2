// Testes das rotas de esteira: nunca atravessam a oficina nem a doca, e terminam no estoque.
// Rodar na pasta do projeto: node testes/rotas.test.mjs
import assert from 'node:assert/strict';
import { BLOQUEIOS, cruza, rotaEsteira } from '../js/rotas.js';

const ESTOQUE = { x: -8, z: -6 };
const dentro = (x, z) => BLOQUEIOS.some((r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);

let rotas = 0;
for (let x = -11; x <= 11; x++) {
  for (let z = -11; z <= 11; z++) {
    if (dentro(x, z) || (x === ESTOQUE.x && z === ESTOQUE.z)) continue;
    const rota = rotaEsteira({ x, z }, ESTOQUE);
    assert.deepEqual(rota[0], { x, z });
    assert.deepEqual(rota.at(-1), ESTOQUE);
    for (let i = 1; i < rota.length; i++) {
      const p = rota[i - 1], q = rota[i];
      assert.ok(p.x === q.x || p.z === q.z, `trecho diagonal em ${x},${z}`);
      assert.ok(!cruza(p, q), `rota de ${x},${z} atravessa um bloqueio: ${JSON.stringify(rota)}`);
    }
    rotas += 1;
  }
}
console.log(`PASS: ${rotas} posições de máquina, nenhuma esteira atravessa a oficina, a doca ou a van`);

const simples = rotaEsteira({ x: -8, z: -10 }, ESTOQUE);
assert.equal(simples.length, 2, 'máquina alinhada ao estoque: esteira reta');
console.log('PASS: máquina alinhada ganha esteira reta');
console.log('\n2 testes passaram.');
