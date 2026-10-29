// Testes da v0.6: qualidade, manutenção e energia.
// Rodar na pasta do projeto: node testes/qualidade.test.mjs
import assert from 'node:assert/strict';
import {
  CUSTO_CONSERTO,
  DESGASTE_POR_CAIXA,
  LIMIAR_QUEBRA,
  chanceDefeito,
  chanceQuebra,
  custoInspecaoManual,
  custoManutencao,
  fazerManutencao,
  registrarProducao,
} from '../js/qualidade.js';
import {
  CONSUMO,
  consumir,
  energiaCortada,
  importarEnergia,
  novaEnergia,
  pagarDivida,
  tarifa,
  virarDia,
} from '../js/energia.js';
import { atualizarAutomacao, estadoMaquina, programar } from '../js/automacao.js';
import { produtoPorChave } from '../js/catalogo.js';
import {
  defeituosasNoEstoque,
  guardarNoEstoque,
  quantidadeDe,
  retirar,
  separarDefeituosas,
  totalNoEstoque,
  venderTudo,
} from '../js/estoque.js';
import { aceitar, entregar, gerarOferta, novoQuadro, GANHO_REPUTACAO, REPUTACAO_INICIAL } from '../js/contratos.js';

const nunca = () => 0.999;
const sempre = () => 0;
const P = produtoPorChave('P-0-0');

let ok = 0;
function teste(nome, fn) {
  fn();
  ok += 1;
  console.log(`PASS: ${nome}`);
}

teste('defeito sobe com o desgaste; quebra só acima do limiar', () => {
  assert.equal(chanceDefeito(0), 0.03);
  assert.ok(Math.abs(chanceDefeito(100) - 0.28) < 1e-9);
  assert.equal(chanceQuebra(LIMIAR_QUEBRA - 1), 0);
  assert.equal(chanceQuebra(85), 0);
  assert.ok(chanceQuebra(95) > 0 && chanceQuebra(95) <= 0.02);
  assert.equal(chanceQuebra(100), 1);
});

teste('cada caixa desgasta a máquina; com 100% ela quebra', () => {
  const m = { desgaste: 0 };
  for (let i = 0; i < 10; i++) registrarProducao(m, nunca);
  assert.equal(m.desgaste, 10 * DESGASTE_POR_CAIXA);
  assert.ok(!m.quebrada);
  m.desgaste = 99.5;
  const r = registrarProducao(m, nunca);
  assert.equal(m.desgaste, 100);
  assert.equal(r.quebrou, true);
  assert.equal(m.quebrada, true);
});

teste('manutenção preventiva é barata e conserto custa mais; ambos zeram o desgaste', () => {
  const m = { desgaste: 40, quebrada: false };
  assert.equal(custoManutencao(m), 12);
  assert.equal(custoManutencao({ desgaste: 2 }), 5);
  assert.ok(custoManutencao({ desgaste: 99 }) <= 30);
  m.quebrada = true;
  assert.equal(custoManutencao(m), CUSTO_CONSERTO);
  fazerManutencao(m);
  assert.deepEqual(m, { desgaste: 0, quebrada: false });
});

teste('estoque conta defeituosas e a inspeção manual as separa', () => {
  venderTudo();
  guardarNoEstoque(P, 10, 3);
  assert.equal(defeituosasNoEstoque(), 3);
  assert.equal(custoInspecaoManual(10), 2);
  assert.equal(separarDefeituosas(), 3);
  assert.equal(totalNoEstoque(), 7);
  assert.equal(defeituosasNoEstoque(), 0);
});

teste('venda avulsa paga metade pela caixa defeituosa', () => {
  venderTudo();
  guardarNoEstoque(P, 4, 2);
  assert.equal(venderTudo(), 2 * P.valor + 2 * P.valor * 0.5);
});

teste('retirada para contrato leva defeituosas na mesma proporção do estoque', () => {
  venderTudo();
  guardarNoEstoque(P, 10, 5);
  assert.deepEqual(retirar('P-0-0', 4), { defeituosas: 2 });
  assert.equal(quantidadeDe('P-0-0'), 6);
  assert.equal(retirar('P-0-0', 7), false);
});

teste('contrato com caixa defeituosa: devolução, pagamento menor e reputação cai', () => {
  venderTudo();
  const q = novoQuadro();
  q.ofertas.push(gerarOferta(q, produtoPorChave, () => 0));
  const { contrato } = aceitar(q, 0);
  guardarNoEstoque(P, contrato.quantidade, 1);
  const [entregue] = entregar(q, { quantidade: quantidadeDe, retirar });
  assert.equal(entregue.devolvidas, 1);
  assert.equal(entregue.recebido, Math.round((contrato.pagamento * (contrato.quantidade - 1)) / contrato.quantidade));
  assert.equal(q.reputacao, REPUTACAO_INICIAL - 2);
  assert.equal(q.devolucoes, 1);
});

teste('contrato sem defeito continua dando reputação', () => {
  venderTudo();
  const q = novoQuadro();
  q.ofertas.push(gerarOferta(q, produtoPorChave, () => 0));
  const { contrato } = aceitar(q, 0);
  guardarNoEstoque(P, contrato.quantidade, 0);
  const [entregue] = entregar(q, { quantidade: quantidadeDe, retirar });
  assert.equal(entregue.recebido, contrato.pagamento);
  assert.equal(q.reputacao, REPUTACAO_INICIAL + GANHO_REPUTACAO);
});

// Máquina simulada para a automação.
function maquina(esteira = false) {
  return {
    x: 0, z: 0, saida: [], transito: [], automatica: false, produto: null, cronometroProducao: 0, cronometroEsteira: 0,
    esteira: esteira ? {} : null, comprimentoEsteira: esteira ? 4 : 0, desgaste: 0, quebrada: false, inspecao: false,
  };
}
function simular(maquinas, segundos, acoes) {
  for (let t = 0; t < segundos; t += 0.05) atualizarAutomacao(maquinas, 0.05, acoes);
}

teste('máquina quebrada e corte de energia param a linha automática', () => {
  let produzidas = 0;
  const acoes = { podePagar: () => true, produzir: (m) => { produzidas += 1; m.saida.push({ produto: P }); }, posicionar() {}, entregar() {} };
  const m = maquina(true);
  programar(m, P);
  m.quebrada = true;
  simular([m], 10, acoes);
  assert.equal(produzidas, 0);
  assert.equal(estadoMaquina(m, true), 'quebrada');
  m.quebrada = false;
  simular([m], 10, { ...acoes, semEnergia: () => true });
  assert.equal(produzidas, 0);
  assert.equal(estadoMaquina(m, true, true), 'sem-energia');
  simular([m], 10, acoes);
  assert.ok(produzidas >= 3);
});

teste('inspetor na esteira manda as defeituosas para o refugo', () => {
  const entregues = [];
  const descartadas = [];
  const acoes = { podePagar: () => true, produzir() {}, posicionar() {}, entregar: (i) => entregues.push(i), descartar: (i) => descartadas.push(i) };
  const m = maquina(true);
  m.inspecao = true;
  m.saida = [{ produto: P, defeito: false }, { produto: P, defeito: true }, { produto: P, defeito: false }];
  simular([m], 15, acoes);
  assert.equal(descartadas.length, 1);
  assert.equal(entregues.length, 2);
  assert.ok(entregues.every((i) => !i.defeito));
});

teste('tarifa: noturna mais barata, pico mais caro', () => {
  assert.equal(tarifa(3).nome, 'noturna');
  assert.equal(tarifa(10).nome, 'normal');
  assert.equal(tarifa(19).nome, 'pico');
  const e = novaEnergia();
  consumir(e, { produzindo: 1, esteiras: 0, paradas: 0 }, 1, 10);
  assert.equal(e.contaDia, CONSUMO.produzindo);
  consumir(e, { produzindo: 1, esteiras: 0, paradas: 0 }, 1, 19);
  assert.equal(e.contaDia, CONSUMO.produzindo * 2.5);
});

teste('conta cobrada na virada do dia; sem dinheiro vira dívida e corta a energia', () => {
  const e = novaEnergia();
  e.contaDia = 30;
  assert.equal(virarDia(e, 1, () => 30), null, 'mesmo dia: nada a cobrar');
  let caixa = 10;
  const cobrar = (v) => { const pago = Math.min(caixa, v); caixa -= pago; return pago; };
  assert.deepEqual(virarDia(e, 2, cobrar), { fatura: 30, pago: 10 });
  assert.equal(e.divida, 20);
  assert.equal(energiaCortada(e), true);
  caixa = 50;
  pagarDivida(e, cobrar);
  assert.equal(e.divida, 0);
  assert.equal(caixa, 30);
  assert.equal(energiaCortada(e), false);
});

teste('energia vai e volta pelo save e dados ruins são corrigidos', () => {
  assert.deepEqual(importarEnergia({ contaDia: 4, divida: 2, dia: 3, ontem: 9 }), { contaDia: 4, divida: 2, dia: 3, ontem: 9 });
  assert.deepEqual(importarEnergia({ contaDia: -5, dia: 0 }), { contaDia: 0, divida: 0, dia: 1, ontem: 0 });
  assert.deepEqual(importarEnergia(null), novaEnergia());
});

console.log(`\n${ok} testes passaram.`);

