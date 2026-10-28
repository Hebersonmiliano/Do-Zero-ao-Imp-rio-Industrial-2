import assert from 'node:assert/strict';
import { avaliarCampanha } from '../js/campanha.js';
assert.equal(avaliarCampanha({}).concluidas, 0);
assert.equal(avaliarCampanha({ vendido: 6000 }).concluidas, 1, 'vendas não pulam objetivos de produção');
assert.equal(avaliarCampanha({ vendido: 100, caixas: 30 }).concluidas, 2);
assert.equal(avaliarCampanha({}, 4).concluidas, 4, 'objetivos atingidos não regridem');
assert.equal(avaliarCampanha({ vendido: 5000, caixas: 30, funcionarios: 1, linhas: 1, cumpridos: 5, entregas: 10, propriedade: 3 }).venceu, true);
console.log('PASS: campanha respeita sequência, preserva marcos e conclui com todos os objetivos');

