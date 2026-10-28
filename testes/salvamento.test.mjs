// Testes do salvamento versionado. Rodar na pasta do projeto: node testes/salvamento.test.mjs
import assert from 'node:assert/strict';
import { CHAVE_BACKUP, CHAVE_SAVE, VERSAO_SAVE, apagar, armazenamentoDisponivel, carregar, codigoDoSave, gravar, lerCodigo, lerSave, montarSave } from '../js/salvamento.js';
import { ciclar, exportarEscolha, importarEscolha, produtoAtual, produtoPorChave } from '../js/catalogo.js';
import { exportarEstoque, guardarNoEstoque, importarEstoque, totalNoEstoque } from '../js/estoque.js';
import { exportarEconomia, getDinheiro, getVendido, importarEconomia, pagar, receber } from '../js/economia.js';

// Armazenamento falso no lugar do localStorage.
function memoria() {
  const dados = new Map();
  return {
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => dados.set(k, String(v)),
    removeItem: (k) => dados.delete(k),
    dados,
  };
}

let ok = 0;
function teste(nome, fn) {
  fn();
  ok += 1;
  console.log(`PASS: ${nome}`);
}

teste('produto é reconstruído pela chave', () => {
  ciclar('tamanho');
  ciclar('material');
  const p = produtoAtual();
  assert.deepEqual(produtoPorChave(p.chave), p);
  assert.equal(produtoPorChave('X-0-0'), null);
  assert.equal(produtoPorChave('P-9-0'), null);
  assert.equal(produtoPorChave('lixo'), null);
});

teste('economia, estoque e escolha voltam iguais', () => {
  pagar(30);
  receber(55);
  guardarNoEstoque(produtoAtual(), 4);
  const economia = exportarEconomia();
  const estoque = exportarEstoque();
  const escolha = exportarEscolha();
  importarEconomia({});
  importarEstoque([], produtoPorChave);
  importarEscolha({});
  assert.equal(getDinheiro(), 100);
  assert.equal(totalNoEstoque(), 0);
  importarEconomia(economia);
  importarEstoque(estoque, produtoPorChave);
  importarEscolha(escolha);
  assert.equal(getDinheiro(), 125);
  assert.equal(totalNoEstoque(), 4);
  assert.equal(produtoAtual().chave, 'M-0-1');
  assert.equal(getVendido(), 55);
});

teste('máquinas, funcionários e jogador vão e voltam pelo save', () => {
  const produto = produtoAtual();
  const maquina = {
    x: 2, z: 6, esteira: {}, automatica: true, produto,
    saida: [{ produto }, { produto }], transito: [{ produto }],
  };
  const save = montarSave({
    economia: exportarEconomia(), estoque: exportarEstoque(), escolha: exportarEscolha(), caixas: 12,
    jogador: { x: 1.5, z: -3 }, maquinas: [maquina], funcionarios: [{ x: -3, z: 3.5 }],
  });
  const lido = lerSave(JSON.stringify(save));
  assert.equal(lido.versao, VERSAO_SAVE);
  assert.equal(lido.caixas, 12);
  assert.deepEqual(lido.jogador, { x: 1.5, z: -3 });
  assert.deepEqual(lido.funcionarios, [{ x: -3, z: 3.5 }]);
  const m = lido.maquinas[0];
  assert.equal(m.saida.length, 3, 'caixa em trânsito volta para a saída');
  assert.equal(m.esteira, true);
  assert.equal(m.automatica, true);
  assert.equal(m.produto, produto.chave);
});

teste('save inválido ou de versão futura não carrega', () => {
  assert.equal(lerSave('não é json'), null);
  assert.equal(lerSave('{}'), null);
  assert.equal(lerSave(JSON.stringify({ versao: VERSAO_SAVE + 1 })), null);
});

teste('dados estragados são corrigidos ao ler', () => {
  const lido = lerSave(JSON.stringify({
    versao: VERSAO_SAVE,
    caixas: -5,
    jogador: { x: 999, z: 'a' },
    maquinas: [{ x: 1, z: 1, saida: Array(20).fill('P-0-0') }, { x: 1, z: 1 }, null],
    funcionarios: [{ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 2, z: 0 }, { x: 3, z: 0 }],
    estoque: [['P-0-0', 2], 'lixo'],
  }));
  assert.equal(lido.caixas, 0);
  assert.equal(lido.jogador.x, 11.5);
  assert.equal(lido.maquinas.length, 1, 'máquina repetida na mesma célula é descartada');
  assert.equal(lido.maquinas[0].saida.length, 8, 'saída respeita a capacidade');
  assert.equal(lido.funcionarios.length, 3, 'respeita o limite de funcionários');
  assert.equal(lido.estoque.length, 1);
  importarEconomia({ dinheiro: -50 });
  assert.equal(getDinheiro(), 100);
});

teste('save da versão 1 é migrado até a atual (contratos, qualidade e energia)', () => {
  const v1 = {
    versao: 1, caixas: 9, jogador: { x: 0, z: 4 }, maquinas: [], funcionarios: [], estoque: [], escolha: {},
    economia: { dinheiro: 140, vendido: 300, pedido: { quantidade: 11, bonus: 70 }, pedidosCumpridos: 2 },
  };
  const lido = lerSave(JSON.stringify(v1));
  assert.equal(lido.versao, 3, 'migra 1 → 2 → 3');
  assert.deepEqual(lido.economia, { dinheiro: 140, vendido: 300 });
  assert.equal(lido.refugo, 0);
  assert.deepEqual(lido.contratos, { reputacao: 30, cumpridos: 2 });
});

teste('defeitos, desgaste, inspetor, energia e refugo vão e voltam pelo save (v0.6)', () => {
  const produto = produtoAtual();
  const maquina = {
    x: 3, z: 6, esteira: {}, automatica: false, produto: null, inspecao: true, desgaste: 64, quebrada: true,
    saida: [{ produto, defeito: true }, { produto, defeito: false }], transito: [],
  };
  const save = montarSave({
    economia: exportarEconomia(), estoque: [['P-0-0', 5, 2]], escolha: {}, caixas: 1,
    energia: { contaDia: 3.5, divida: 0, dia: 2, ontem: 12 }, refugo: 7,
    jogador: { x: 0, z: 4 }, maquinas: [maquina], funcionarios: [],
  });
  assert.deepEqual(save.maquinas[0].saida, [`${produto.chave}*`, produto.chave]);
  const lido = lerSave(JSON.stringify(save));
  const m = lido.maquinas[0];
  assert.deepEqual(m.saida, [{ chave: produto.chave, defeito: true }, { chave: produto.chave, defeito: false }]);
  assert.equal(m.desgaste, 64);
  assert.equal(m.quebrada, true);
  assert.equal(m.inspecao, true);
  assert.equal(lido.refugo, 7);
  assert.deepEqual(lido.energia, { contaDia: 3.5, divida: 0, dia: 2, ontem: 12 });
  assert.deepEqual(lido.estoque, [['P-0-0', 5, 2]]);
});

teste('gravar, carregar e apagar no armazenamento', () => {
  const mem = memoria();
  assert.equal(carregar(mem), null);
  const save = montarSave({
    economia: exportarEconomia(), estoque: [], escolha: {}, caixas: 3,
    jogador: { x: 0, z: 4 }, maquinas: [], funcionarios: [],
  });
  assert.equal(gravar(save, mem), true);
  assert.ok(mem.dados.has(CHAVE_SAVE));
  assert.equal(carregar(mem).caixas, 3);
  apagar(mem);
  assert.equal(carregar(mem), null);
});

teste('armazenamento bloqueado não quebra o jogo', () => {
  const bloqueado = {
    getItem() { throw new Error('bloqueado'); },
    setItem() { throw new Error('bloqueado'); },
    removeItem() { throw new Error('bloqueado'); },
  };
  assert.equal(gravar({ versao: 1 }, bloqueado), false);
  assert.equal(carregar(bloqueado), null);
  apagar(bloqueado);
});

teste('cópia de segurança salva o progresso se o save principal estragar (v0.6.3)', () => {
  const mem = memoria();
  const save = montarSave({ economia: exportarEconomia(), estoque: [], escolha: {}, caixas: 42, jogador: { x: 0, z: 4 }, maquinas: [], funcionarios: [] });
  gravar(save, mem, { backup: true });
  assert.ok(mem.dados.has(CHAVE_BACKUP));
  mem.setItem(CHAVE_SAVE, '{estragado');
  assert.equal(carregar(mem).caixas, 42, 'usa a cópia de segurança');
  apagar(mem);
  assert.equal(mem.dados.size, 0, 'novo jogo apaga as duas chaves');
});

teste('código do progresso vai e volta, com acentos, e código ruim é recusado', () => {
  const save = montarSave({ economia: exportarEconomia(), estoque: [['M-1-1', 3, 0]], escolha: {}, caixas: 7, jogador: { x: 1, z: 2 }, maquinas: [], funcionarios: [] });
  save.anotacao = 'Império çãõ';
  const codigo = codigoDoSave(save);
  assert.ok(codigo.startsWith('II2-'));
  const volta = lerCodigo(`  ${codigo.slice(0, 20)}\n${codigo.slice(20)}  `);
  assert.equal(volta.caixas, 7);
  assert.equal(volta.anotacao, 'Império çãõ');
  assert.equal(lerCodigo('qualquer coisa'), null);
  assert.equal(lerCodigo('II2-@@@'), null);
  assert.equal(lerCodigo('II2-' + btoa('{"versao":99}')), null, 'versão futura');
});

teste('detecta navegador que não deixa salvar', () => {
  assert.equal(armazenamentoDisponivel(memoria()), true);
  assert.equal(armazenamentoDisponivel({ setItem() { throw new Error('bloqueado'); }, removeItem() {} }), false);
});

console.log(`\n${ok} testes passaram.`);
