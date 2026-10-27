// Testes da v0.4: linha automática sem o jogador, limite da saída e vazão da esteira.
// Rodar na pasta do projeto: node testes/automacao.test.mjs
import assert from 'node:assert/strict';
import {
  CAPACIDADE_SAIDA,
  INTERVALO_ESTEIRA,
  TEMPO_AUTOMATICO,
  VELOCIDADE_ESTEIRA,
  atualizarAutomacao,
  estadoMaquina,
  programar,
  saidaCheia,
} from '../js/automacao.js';
import { produtoAtual } from '../js/catalogo.js';
import { guardarNoEstoque, totalNoEstoque, venderTudo } from '../js/estoque.js';
import { CUSTO_PRODUCAO, getDinheiro, pagar } from '../js/economia.js';

// Máquina sem malha: só os campos que a lógica usa.
function maquina(comEsteira = false) {
  return {
    x: 0, z: 0, saida: [], transito: [], automatica: false, produto: null,
    cronometroProducao: 0, cronometroEsteira: 0,
    esteira: comEsteira ? {} : null, comprimentoEsteira: comEsteira ? 6 : 0,
  };
}

// Mesmas regras da cena, sem Three.js: paga o papelão, empilha na saída e guarda no estoque ao fim da esteira.
const acoes = {
  podePagar: () => getDinheiro() >= CUSTO_PRODUCAO,
  produzir(m, produto) {
    if (pagar(CUSTO_PRODUCAO)) m.saida.push({ produto });
  },
  posicionar() {},
  entregar(item) {
    guardarNoEstoque(item.produto);
  },
};

function simular(maquinas, segundos, passo = 0.05) {
  for (let t = 0; t < segundos; t += passo) atualizarAutomacao(maquinas, passo, acoes);
}

let ok = 0;
function teste(nome, fn) {
  fn();
  ok += 1;
  console.log(`PASS: ${nome}`);
}

teste('máquina manual não produz sozinha', () => {
  const m = maquina(true);
  simular([m], 10);
  assert.equal(m.saida.length, 0);
  assert.equal(estadoMaquina(m, true), 'manual');
});

teste('programar torna automática e depois só reprograma', () => {
  const m = maquina();
  assert.equal(programar(m, produtoAtual()), true);
  assert.equal(programar(m, produtoAtual()), false);
  assert.equal(m.automatica, true);
});

teste('sem esteira, a saída enche e a máquina para (gargalo)', () => {
  const m = maquina();
  programar(m, produtoAtual());
  const antes = getDinheiro();
  simular([m], TEMPO_AUTOMATICO * (CAPACIDADE_SAIDA + 5));
  assert.equal(m.saida.length, CAPACIDADE_SAIDA);
  assert.equal(saidaCheia(m), true);
  assert.equal(estadoMaquina(m, true), 'cheia');
  assert.equal(antes - getDinheiro(), CAPACIDADE_SAIDA * CUSTO_PRODUCAO, 'não cobra papelão com a saída cheia');
});

teste('linha completa roda sem o jogador: máquina automática + esteira enchem o estoque', () => {
  venderTudo();
  const m = maquina(true);
  programar(m, produtoAtual());
  simular([m], 60);
  const viagem = m.comprimentoEsteira / VELOCIDADE_ESTEIRA;
  const esperado = Math.floor((60 - viagem) / TEMPO_AUTOMATICO);
  assert.ok(totalNoEstoque() >= esperado - 1, `estoque ${totalNoEstoque()}, esperado ~${esperado}`);
  assert.ok(m.saida.length <= 1, 'a esteira dá conta da produção de uma máquina');
});

teste('esteira tem vazão limitada: uma caixa a cada intervalo', () => {
  venderTudo();
  const m = maquina(true);
  for (let i = 0; i < 8; i++) m.saida.push({ produto: produtoAtual() });
  simular([m], INTERVALO_ESTEIRA * 3 + 0.01);
  assert.equal(m.transito.length + totalNoEstoque(), 3);
  assert.equal(m.saida.length, 5);
});

teste('sem dinheiro para papelão, a máquina espera e mostra o motivo', () => {
  const m = maquina(true);
  programar(m, produtoAtual());
  while (pagar(1));
  simular([m], 10);
  assert.equal(m.saida.length, 0);
  assert.equal(estadoMaquina(m, acoes.podePagar()), 'sem-dinheiro');
});

console.log(`\n${ok} testes passaram.`);
