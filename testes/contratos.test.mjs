// Testes da v0.5: clientes, contratos, prazos, multas e reputação.
// Rodar na pasta do projeto: node testes/contratos.test.mjs
import assert from 'node:assert/strict';
import {
  CLIENTES,
  GANHO_REPUTACAO,
  INTERVALO_OFERTA,
  INTERVALO_QUADRO_VAZIO,
  MAX_ATIVOS,
  MAX_OFERTAS,
  MULTA,
  PERDA_REPUTACAO,
  REPUTACAO_INICIAL,
  VALIDADE_OFERTA,
  aceitar,
  atualizarContratos,
  chavesReservadas,
  clientesDisponiveis,
  entregar,
  exportarQuadro,
  gerarOferta,
  importarQuadro,
  nivel,
  novoQuadro,
} from '../js/contratos.js';
import { produtoPorChave } from '../js/catalogo.js';
import { guardarNoEstoque, quantidadeDe, retirar, totalNoEstoque, venderTudo } from '../js/estoque.js';

// Sorteio previsível: sempre a primeira opção e a menor quantidade.
const primeiro = () => 0;
const estoque = { quantidade: quantidadeDe, retirar };

let ok = 0;
function teste(nome, fn) {
  fn();
  ok += 1;
  console.log(`PASS: ${nome}`);
}

teste('todo cliente pede só produtos que existem no catálogo', () => {
  for (const c of CLIENTES)
    for (const t of c.tamanhos) for (const cor of c.cores) for (const m of c.materiais)
      assert.ok(produtoPorChave(`${t}-${cor}-${m}`), `${c.id}: ${t}-${cor}-${m}`);
});

teste('reputação libera clientes maiores', () => {
  assert.deepEqual(clientesDisponiveis(0).map((c) => c.id), ['mercadinho', 'presentes']);
  assert.equal(clientesDisponiveis(100).length, CLIENTES.length);
  assert.equal(nivel(REPUTACAO_INICIAL), 'Bairro');
  assert.equal(nivel(65), 'Regional');
});

teste('contrato paga mais que a venda avulsa', () => {
  const q = novoQuadro();
  for (let i = 0; i < 50; i++) {
    const o = gerarOferta(q, produtoPorChave);
    assert.ok(o.pagamento > produtoPorChave(o.chave).valor * o.quantidade, JSON.stringify(o));
  }
});

teste('primeira oferta aparece logo e as seguintes a cada intervalo', () => {
  const q = novoQuadro();
  assert.equal(atualizarContratos(q, 0.05, produtoPorChave, primeiro).novas.length, 1);
  atualizarContratos(q, INTERVALO_OFERTA - 1, produtoPorChave, primeiro);
  assert.equal(q.ofertas.length, 1);
  atualizarContratos(q, 1, produtoPorChave, primeiro);
  assert.equal(q.ofertas.length, 2);
  for (let i = 0; i < 5; i++) atualizarContratos(q, INTERVALO_OFERTA, produtoPorChave, primeiro);
  assert.ok(q.ofertas.length <= MAX_OFERTAS);
});

teste('quadro vazio recebe cliente mais rápido', () => {
  const q = novoQuadro();
  atualizarContratos(q, 0.05, produtoPorChave, primeiro);
  aceitar(q, 0);
  atualizarContratos(q, INTERVALO_QUADRO_VAZIO - 0.5, produtoPorChave, primeiro);
  assert.equal(q.ofertas.length, 0);
  atualizarContratos(q, 1, produtoPorChave, primeiro);
  assert.equal(q.ofertas.length, 1);
});

teste('oferta não aceita expira sem multa', () => {
  const q = novoQuadro();
  atualizarContratos(q, 0.05, produtoPorChave, primeiro);
  q.cronometro = -1e9; // sem ofertas novas neste teste
  const ev = atualizarContratos(q, VALIDADE_OFERTA, produtoPorChave, primeiro);
  assert.equal(ev.expiradas.length, 1);
  assert.equal(q.ofertas.length, 0);
  assert.equal(q.reputacao, REPUTACAO_INICIAL);
});

teste('aceitar, entregar no prazo, receber e ganhar reputação', () => {
  venderTudo();
  const q = novoQuadro();
  atualizarContratos(q, 0.05, produtoPorChave, primeiro);
  const { contrato } = aceitar(q, 0);
  assert.equal(contrato.chave, 'P-0-0');
  assert.equal(contrato.restante, contrato.prazo);
  assert.equal(q.ofertas.length, 0);
  guardarNoEstoque(produtoPorChave('P-0-0'), contrato.quantidade - 1);
  assert.equal(entregar(q, estoque).length, 0, 'falta uma caixa: não entrega');
  guardarNoEstoque(produtoPorChave('P-0-0'), 3);
  const entregues = entregar(q, estoque);
  assert.equal(entregues.length, 1);
  assert.equal(quantidadeDe('P-0-0'), 2, 'retira só a quantidade do contrato');
  assert.equal(q.reputacao, REPUTACAO_INICIAL + GANHO_REPUTACAO);
  assert.equal(q.cumpridos, 1);
});

teste('prazo vencido cobra multa e tira reputação', () => {
  const q = novoQuadro();
  atualizarContratos(q, 0.05, produtoPorChave, primeiro);
  const { contrato } = aceitar(q, 0);
  q.cronometro = -1e9;
  const ev = atualizarContratos(q, contrato.prazo + 1, produtoPorChave, primeiro);
  assert.equal(ev.vencidos.length, 1);
  assert.equal(ev.vencidos[0].multa, Math.round(contrato.pagamento * MULTA));
  assert.equal(q.reputacao, REPUTACAO_INICIAL - PERDA_REPUTACAO);
  assert.equal(q.ativos.length, 0);
  assert.equal(q.vencidos, 1);
});

teste('limite de contratos ao mesmo tempo', () => {
  const q = novoQuadro();
  for (let i = 0; i <= MAX_ATIVOS; i++) q.ofertas.push(gerarOferta(q, produtoPorChave, primeiro));
  for (let i = 0; i < MAX_ATIVOS; i++) assert.ok(aceitar(q, 0).contrato);
  assert.ok(aceitar(q, 0).erro);
  assert.ok(aceitar(q, 5).erro);
});

teste('venda avulsa guarda as caixas reservadas para contratos', () => {
  venderTudo();
  const q = novoQuadro();
  q.ofertas.push(gerarOferta(q, produtoPorChave, primeiro));
  aceitar(q, 0);
  guardarNoEstoque(produtoPorChave('P-0-0'), 2);
  guardarNoEstoque(produtoPorChave('G-1-1'), 1);
  const valor = venderTudo(chavesReservadas(q));
  assert.equal(valor, produtoPorChave('G-1-1').valor);
  assert.equal(totalNoEstoque(), 2);
});

teste('quadro vai e volta pelo save, e dados ruins são descartados', () => {
  const q = novoQuadro();
  q.reputacao = 47;
  q.ofertas.push(gerarOferta(q, produtoPorChave, primeiro));
  aceitar(q, 0);
  q.ativos[0].restante = 33;
  q.ofertas.push(gerarOferta(q, produtoPorChave, primeiro));
  const volta = importarQuadro(JSON.parse(JSON.stringify(exportarQuadro(q))), produtoPorChave);
  assert.deepEqual(volta, q);
  const ruim = importarQuadro(
    { reputacao: 500, ativos: [{ cliente: 'x', chave: 'P-0-0', quantidade: 2, pagamento: 10 }], ofertas: [{ cliente: 'mercadinho', chave: 'Z-9-9', quantidade: 2, pagamento: 5 }] },
    produtoPorChave,
  );
  assert.equal(ruim.reputacao, 100);
  assert.equal(ruim.ativos.length, 0);
  assert.equal(ruim.ofertas.length, 0);
  assert.equal(importarQuadro(null, produtoPorChave).reputacao, REPUTACAO_INICIAL);
});

console.log(`\n${ok} testes passaram.`);
