// Cena do Distrito Industrial: terreno, oficina, jogador, máquinas, funcionários, linha automática e contratos.
// O visual (modelos, luz, câmera e rótulos) fica em js/visual/; aqui ficam as regras ligadas à cena.
import * as THREE from 'three';
import { registrarObstaculo, cabeAqui } from './grade.js';
import { criarJogador, atualizarJogador } from './jogador.js';
import {
  criarMaquina,
  criarCaixa,
  criarEsteira,
  maquinaProxima,
  marcarAutomatica,
  mostrarEstado,
  posicionarNaEsteira,
  animarEsteiras,
  animarMaquina,
} from './producao.js';
import {
  CAPACIDADE_SAIDA,
  CUSTO_AUTOMACAO,
  atualizarAutomacao,
  estadoMaquina,
  programar,
  saidaCheia,
} from './automacao.js';
import { ciclar, produtoAtual, produtoPorChave, exportarEscolha, importarEscolha } from './catalogo.js';
import {
  guardarNoEstoque,
  totalNoEstoque,
  resumoEstoque,
  venderTudo,
  quantidadeDe,
  retirar,
  exportarEstoque,
  importarEstoque,
} from './estoque.js';
import { apagar, carregar, gravar, montarSave } from './salvamento.js';
import {
  MAX_ATIVOS,
  aceitar,
  atualizarContratos,
  chavesReservadas,
  entregar,
  exportarQuadro,
  importarQuadro,
  nivel,
  nomeCliente,
  novoQuadro,
} from './contratos.js';
import { criarFuncionario, atualizarFuncionario, ESTOQUE_PONTO } from './funcionarios.js';
import { criarCenario } from './cenario.js';
import { criarAmbiente } from './visual/ambiente.js';
import { criarCameraJogo } from './visual/camera.js';
import { criarRotulos } from './visual/rotulos.js';
import { criarOficina } from './visual/oficina.js';
import { criarCursor, criarTerreno } from './visual/terreno.js';
import { criarExpedicao, criarPrateleira, criarVan } from './visual/estacoes.js';
import {
  CUSTO_ESTEIRA,
  CUSTO_FUNCIONARIO,
  CUSTO_MAQUINA,
  CUSTO_PRODUCAO,
  META_VENDAS,
  cobrarMulta,
  exportarEconomia,
  importarEconomia,
  getDinheiro,
  getVendido,
  pagar,
  receber,
  venceu,
} from './economia.js';

const palco = document.getElementById('palco');
const elCaixas = document.getElementById('caixas');
const elMaquinas = document.getElementById('maquinas');
const elMensagem = document.getElementById('mensagem');
const elProduto = document.getElementById('produto');
const elEstoque = document.getElementById('estoque');
const elDetalheEstoque = document.getElementById('detalhe-estoque');
const elDinheiro = document.getElementById('dinheiro');
const elMeta = document.getElementById('meta');
const elFuncionarios = document.getElementById('funcionarios');
const elReputacao = document.getElementById('reputacao');
const elOfertas = document.getElementById('ofertas');
const elAtivos = document.getElementById('ativos');
const elHistorico = document.getElementById('historico-contratos');
const elLinha = document.getElementById('linha');
const elRelogio = document.getElementById('relogio');
const elBarraMeta = document.getElementById('barra-meta');
const elCorProduto = document.getElementById('cor-produto');
const elAjuda = document.getElementById('ajuda');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
palco.appendChild(renderer.domElement);

const cena = new THREE.Scene();
const ambiente = criarAmbiente(cena, renderer);
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);

criarCenario(cena);
criarTerreno(cena);
const cursor = criarCursor(cena);

// Oficina alugada no centro do terreno (5 x 3 células).
criarOficina(cena);
registrarObstaculo(-2.5, 2.5, -1.5, 1.5);

// Expedição: doca onde contratos são entregues e o estoque livre é vendido (tecla V, perto do ponto).
const EXPEDICAO = { x: -8, z: 4 };
criarExpedicao(cena, EXPEDICAO.x, EXPEDICAO.z);
registrarObstaculo(EXPEDICAO.x - 1, EXPEDICAO.x + 1, EXPEDICAO.z - 1, EXPEDICAO.z + 1);
criarVan(cena, EXPEDICAO.x, 9.4);
registrarObstaculo(EXPEDICAO.x - 0.9, EXPEDICAO.x + 0.9, 7.85, 12.2);

// Prateleira do estoque: onde os funcionários e as esteiras deixam as caixas.
const prateleira = criarPrateleira(cena, ESTOQUE_PONTO.x, ESTOQUE_PONTO.z);
registrarObstaculo(ESTOQUE_PONTO.x - 1, ESTOQUE_PONTO.x + 1, ESTOQUE_PONTO.z - 0.5, ESTOQUE_PONTO.z + 0.5);

const rotulos = criarRotulos(document.getElementById('rotulos'), camera);
rotulos.adicionar({ x: ESTOQUE_PONTO.x, y: 2.8, z: ESTOQUE_PONTO.z }, { texto: () => `ESTOQUE · ${totalNoEstoque()}`, classe: 'estacao' });
rotulos.adicionar({ x: EXPEDICAO.x, y: 3.1, z: EXPEDICAO.z }, {
  texto: () => (quadro.ativos.some((c) => quantidadeDe(c.chave) >= c.quantidade) ? 'EXPEDIÇÃO · contrato pronto!' : 'EXPEDIÇÃO'),
  classe: () => (quadro.ativos.some((c) => quantidadeDe(c.chave) >= c.quantidade) ? 'estacao pronto' : 'estacao'),
});

const jogador = criarJogador(0, 4);
cena.add(jogador);
const cameraJogo = criarCameraJogo(camera, renderer.domElement, jogador.position);

const maquinas = [];
const funcionarios = [];
const LIMITE_FUNCIONARIOS = 3;
let caixas = 0;

const teclas = new Set();
let timerMensagem = null;

function mensagem(texto) {
  elMensagem.textContent = texto;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => (elMensagem.textContent = ''), 3000);
}

const reais = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
const corCss = (hex) => `#${hex.toString(16).padStart(6, '0')}`;

function atualizarPlacar() {
  elCaixas.textContent = caixas;
  elMaquinas.textContent = maquinas.length;
  const produto = produtoAtual();
  elProduto.textContent = produto.nome;
  elCorProduto.style.background = corCss(produto.cor);
  elEstoque.textContent = totalNoEstoque();
  elDetalheEstoque.textContent = resumoEstoque();
  elDinheiro.textContent = reais(getDinheiro());
  elMeta.textContent = `${reais(getVendido())} de ${reais(META_VENDAS)}`;
  elBarraMeta.style.width = `${Math.min(100, (getVendido() / META_VENDAS) * 100)}%`;
  elFuncionarios.textContent = funcionarios.length;
  elLinha.textContent = resumoLinha();
  prateleira.atualizar(
    exportarEstoque().map(([chave, quantidade]) => ({ cor: produtoPorChave(chave)?.cor ?? 0xc89b5a, quantidade })),
  );
}

// Resumo da linha para o HUD: quantas máquinas são automáticas e onde a produção travou.
function resumoLinha() {
  if (maquinas.length === 0) return 'sem máquinas';
  const podePagar = getDinheiro() >= CUSTO_PRODUCAO;
  const conta = { produzindo: 0, 'sem-dinheiro': 0, cheia: 0 };
  for (const m of maquinas) {
    const estado = estadoMaquina(m, podePagar);
    if (estado in conta) conta[estado] += 1;
  }
  const automaticas = maquinas.filter((m) => m.automatica).length;
  const partes = [`${automaticas} automática(s)`];
  if (conta.produzindo) partes.push(`${conta.produzindo} produzindo`);
  if (conta.cheia) partes.push(`${conta.cheia} parada(s): saída cheia`);
  if (conta['sem-dinheiro']) partes.push(`${conta['sem-dinheiro']} sem papelão`);
  return partes.join(' · ');
}

// Atualiza a luz de cada máquina e o resumo da linha quando alguma situação muda.
let assinaturaLinha = '';
function atualizarLuzes() {
  const podePagar = getDinheiro() >= CUSTO_PRODUCAO;
  const estados = maquinas.map((m) => estadoMaquina(m, podePagar));
  maquinas.forEach((m, i) => mostrarEstado(m, estados[i]));
  const assinatura = estados.join(',');
  if (assinatura !== assinaturaLinha) {
    assinaturaLinha = assinatura;
    elLinha.textContent = resumoLinha();
  }
}

// Ações que os funcionários usam na cena: produzir, recolher a saída e depositar no estoque.
const acoesFuncionario = {
  podeProduzir: () => getDinheiro() >= CUSTO_PRODUCAO,
  produzir(maquina) {
    if (saidaCheia(maquina) || !pagar(CUSTO_PRODUCAO)) return;
    cena.add(criarCaixa(maquina, produtoAtual()));
    caixas += 1;
    atualizarPlacar();
  },
  recolher(maquina) {
    const levadas = maquina.saida.splice(0);
    for (const { malha } of levadas) cena.remove(malha);
    return levadas.map((item) => item.produto);
  },
  depositar(produtos) {
    for (const produto of produtos) guardarNoEstoque(produto);
    atualizarPlacar();
  },
};

// Liga a esteira da máquina mais próxima: a saída passa a ir sozinha ao estoque.
function ligarEsteira() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para ligar a esteira.');
    return;
  }
  if (maquina.esteira) {
    mensagem('Esta máquina já tem esteira.');
    return;
  }
  if (!pagar(CUSTO_ESTEIRA)) {
    mensagem(`Esteira custa R$ ${CUSTO_ESTEIRA}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  maquina.esteira = criarEsteira(maquina, ESTOQUE_PONTO);
  cena.add(maquina.esteira);
  atualizarPlacar();
  mensagem('Esteira ligada ao estoque.');
}

// Linha automática: máquinas automáticas produzem e as esteiras levam as caixas, uma a uma, ao estoque.
const acoesLinha = {
  podePagar: () => getDinheiro() >= CUSTO_PRODUCAO,
  produzir(maquina, produto) {
    if (!pagar(CUSTO_PRODUCAO)) return;
    cena.add(criarCaixa(maquina, produto));
    caixas += 1;
    atualizarPlacar();
  },
  posicionar(item, maquina, progresso) {
    posicionarNaEsteira(item.malha, maquina, progresso);
  },
  entregar(item) {
    cena.remove(item.malha);
    guardarNoEstoque(item.produto);
    atualizarPlacar();
  },
};

// Torna automática a máquina mais próxima ou troca o produto que ela fabrica.
function automatizarMaquina() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para automatizar.');
    return;
  }
  if (maquina.automatica) {
    programar(maquina, produtoAtual());
    mensagem(`Máquina reprogramada: ${produtoAtual().nome}.`);
    return;
  }
  if (!pagar(CUSTO_AUTOMACAO)) {
    mensagem(`Automação custa R$ ${CUSTO_AUTOMACAO}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  programar(maquina, produtoAtual());
  marcarAutomatica(maquina);
  atualizarPlacar();
  mensagem(
    maquina.esteira
      ? 'Máquina automática: a linha roda sozinha.'
      : 'Máquina automática. Ligue uma esteira (L) para a saída não encher.',
  );
}

// Contrata um funcionário que aparece perto da oficina e trabalha sozinho.
function contratarFuncionario() {
  if (funcionarios.length >= LIMITE_FUNCIONARIOS) {
    mensagem(`Limite de ${LIMITE_FUNCIONARIOS} funcionários.`);
    return;
  }
  if (!pagar(CUSTO_FUNCIONARIO)) {
    mensagem(`Funcionário custa R$ ${CUSTO_FUNCIONARIO}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  const f = criarFuncionario(-3 + funcionarios.length, 3.5);
  cena.add(f.malha);
  funcionarios.push(f);
  atualizarPlacar();
  mensagem('Funcionário contratado.');
}

// Rótulo sobre a máquina: caixas na saída, com a cor da situação.
function rotularMaquina(maquina) {
  rotulos.adicionar({ x: maquina.x, y: 2.15, z: maquina.z }, {
    texto: () => (maquina.saida.length ? `${maquina.saida.length}/${CAPACIDADE_SAIDA}` : ''),
    classe: () => `maquina ${maquina.luz.userData.estado ?? 'manual'}`,
  });
}

// Coloca uma máquina na célula à frente do jogador (1,5 célula), se a célula estiver livre.
function posicionarMaquina() {
  const p = jogador.position;
  const f = jogador.userData.frente;
  const cx = Math.round(p.x + f.x * 1.5);
  const cz = Math.round(p.z + f.z * 1.5);
  if (!cabeAqui(cx, cz)) {
    mensagem('Sem espaço aqui.');
    return;
  }
  if (!pagar(CUSTO_MAQUINA)) {
    mensagem(`Máquina custa R$ ${CUSTO_MAQUINA}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  const maquina = criarMaquina(cx, cz);
  cena.add(maquina.malha);
  maquinas.push(maquina);
  rotularMaquina(maquina);
  registrarObstaculo(cx - 0.45, cx + 0.45, cz - 0.45, cz + 0.45);
  atualizarPlacar();
  mensagem('Máquina posicionada.');
}

// Produz uma caixa do produto escolhido na máquina mais próxima do jogador.
function produzirCaixa() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para produzir.');
    return;
  }
  if (saidaCheia(maquina)) {
    mensagem(`Saída cheia (${CAPACIDADE_SAIDA} caixas). Recolha com R ou ligue uma esteira.`);
    return;
  }
  if (!pagar(CUSTO_PRODUCAO)) {
    mensagem(`Sem dinheiro para papelão (R$ ${CUSTO_PRODUCAO}).`);
    return;
  }
  cena.add(criarCaixa(maquina, produtoAtual()));
  caixas += 1;
  atualizarPlacar();
  mensagem('Caixa produzida.');
}

// Leva a saída da máquina mais próxima para o estoque, separado da produção.
function recolherSaida() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para recolher.');
    return;
  }
  if (maquina.saida.length === 0) {
    mensagem('A saída desta máquina está vazia.');
    return;
  }
  const levadas = maquina.saida.splice(0);
  for (const { malha, produto } of levadas) {
    cena.remove(malha);
    guardarNoEstoque(produto);
  }
  atualizarPlacar();
  mensagem(`${levadas.length} caixa(s) levada(s) ao estoque.`);
}

// Recebe um valor na expedição e avisa se a campanha acabou de ser vencida.
function registrarVenda(valor, texto) {
  const jaVencida = venceu();
  receber(valor);
  rotulos.flutuar({ x: EXPEDICAO.x, y: 2.2, z: EXPEDICAO.z }, `+${reais(valor)}`);
  atualizarPlacar();
  mensagem(
    !jaVencida && venceu()
      ? `${texto} Meta de R$ ${META_VENDAS} atingida: campanha vencida!`
      : texto,
  );
}

// Na expedição: entrega os contratos que o estoque cobre. Sem contrato pronto, vende o estoque
// que nenhum contrato pediu (as caixas reservadas ficam guardadas).
function venderNaExpedicao() {
  const p = jogador.position;
  if (Math.hypot(p.x - EXPEDICAO.x, p.z - EXPEDICAO.z) > 2.2) {
    mensagem('Leve o estoque à expedição (laranja) para vender.');
    return;
  }
  const entregues = entregar(quadro, { quantidade: quantidadeDe, retirar });
  if (entregues.length > 0) {
    const total = entregues.reduce((t, c) => t + c.pagamento, 0);
    const nomes = entregues.map((c) => nomeCliente(c.cliente)).join(', ');
    registrarVenda(total, `Contrato entregue (${nomes}): R$ ${total}. Reputação ${quadro.reputacao}.`);
    mostrarContratos();
    return;
  }
  const valor = venderTudo(chavesReservadas(quadro));
  if (valor === 0) {
    mensagem(
      totalNoEstoque() > 0
        ? 'O estoque está reservado para contratos que ainda não fecharam a quantidade.'
        : 'Nada no estoque para vender.',
    );
    return;
  }
  registrarVenda(valor, `Venda avulsa: R$ ${valor}.`);
}

// ===== Contratos =====

let quadro = novoQuadro();

function tempo(segundos) {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function nomeProduto(chave) {
  return produtoPorChave(chave)?.nome ?? chave;
}

// Desenha o painel de contratos: reputação, ofertas (teclas 1 a 3) e contratos em andamento.
function mostrarContratos() {
  elReputacao.textContent = `${quadro.reputacao} · ${nivel(quadro.reputacao)}`;
  elOfertas.replaceChildren(
    ...quadro.ofertas.map((o, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<kbd>${i + 1}</kbd> <b></b><span></span><small></small>`;
      li.querySelector('b').textContent = nomeCliente(o.cliente);
      li.querySelector('span').textContent = `${o.quantidade}× ${nomeProduto(o.chave)} · R$ ${o.pagamento}`;
      li.querySelector('small').textContent = `Prazo ${tempo(o.prazo)} · oferta some em ${tempo(o.validade)}`;
      return li;
    }),
  );
  if (quadro.ofertas.length === 0) elOfertas.innerHTML = '<li class="vazio">Aguardando clientes…</li>';
  elAtivos.replaceChildren(
    ...quadro.ativos.map((c) => {
      const li = document.createElement('li');
      const tem = Math.min(quantidadeDe(c.chave), c.quantidade);
      li.className = c.restante < 20 ? 'urgente' : tem >= c.quantidade ? 'pronto' : '';
      li.innerHTML = '<b></b><span></span><small></small>';
      li.querySelector('b').textContent = nomeCliente(c.cliente);
      li.querySelector('span').textContent = `${tem}/${c.quantidade} ${nomeProduto(c.chave)} · R$ ${c.pagamento}`;
      li.querySelector('small').textContent =
        tem >= c.quantidade ? `Pronto: entregue na expedição (V) · ${tempo(c.restante)}` : `Faltam ${tempo(c.restante)}`;
      return li;
    }),
  );
  if (quadro.ativos.length === 0) elAtivos.innerHTML = `<li class="vazio">Nenhum. Aceite até ${MAX_ATIVOS} ofertas.</li>`;
  elHistorico.textContent = `${quadro.cumpridos} cumprido(s) · ${quadro.vencidos} vencido(s)`;
}

function aceitarOferta(posicao) {
  const { contrato, erro } = aceitar(quadro, posicao);
  if (erro) {
    mensagem(erro);
    return;
  }
  mensagem(`Contrato aceito: ${contrato.quantidade}× ${nomeProduto(contrato.chave)} para ${nomeCliente(contrato.cliente)}.`);
  mostrarContratos();
}

let cronometroPainel = 0;
function avancarContratos(dt) {
  const eventos = atualizarContratos(quadro, dt, produtoPorChave);
  if (eventos.novas.length) mensagem(`Novo cliente: ${nomeCliente(eventos.novas[0].cliente)} quer um contrato.`);
  for (const { contrato, multa } of eventos.vencidos) {
    const cobrado = cobrarMulta(multa);
    mensagem(`Prazo vencido (${nomeCliente(contrato.cliente)}): multa de R$ ${cobrado}, reputação ${quadro.reputacao}.`);
  }
  cronometroPainel += dt;
  if (cronometroPainel >= 0.25 || eventos.novas.length || eventos.expiradas.length || eventos.vencidos.length) {
    cronometroPainel = 0;
    mostrarContratos();
    if (eventos.vencidos.length) atualizarPlacar();
  }
}

// Troca um campo do catálogo (tamanho, cor ou material) e mostra a nova escolha.
function trocarCatalogo(campo, rotulo) {
  ciclar(campo);
  atualizarPlacar();
  mensagem(`${rotulo}: ${produtoAtual().nome}`);
}

const teclasDeAcao = {
  KeyB: posicionarMaquina,
  KeyE: produzirCaixa,
  KeyR: recolherSaida,
  KeyV: venderNaExpedicao,
  KeyF: contratarFuncionario,
  KeyL: ligarEsteira,
  KeyU: automatizarMaquina,
  KeyN: novoJogo,
  KeyQ: () => cameraJogo.girar(-1),
  KeyZ: () => cameraJogo.girar(1),
  Equal: () => cameraJogo.zoom(1 / 1.15),
  NumpadAdd: () => cameraJogo.zoom(1 / 1.15),
  Minus: () => cameraJogo.zoom(1.15),
  NumpadSubtract: () => cameraJogo.zoom(1.15),
  KeyH: () => elAjuda.classList.toggle('aberta'),
  Digit1: () => aceitarOferta(0),
  Digit2: () => aceitarOferta(1),
  Digit3: () => aceitarOferta(2),
  Numpad1: () => aceitarOferta(0),
  Numpad2: () => aceitarOferta(1),
  Numpad3: () => aceitarOferta(2),
  KeyT: () => trocarCatalogo('tamanho', 'Tamanho'),
  KeyC: () => trocarCatalogo('cor', 'Cor'),
  KeyM: () => trocarCatalogo('material', 'Material'),
};

window.addEventListener('keydown', (e) => {
  teclas.add(e.code);
  if (e.repeat) return;
  teclasDeAcao[e.code]?.();
});
window.addEventListener('keyup', (e) => teclas.delete(e.code));
window.addEventListener('blur', () => teclas.clear());

function ajustarTamanho() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', ajustarTamanho);

// Partes só visuais: dia e noite, câmera, esteiras, máquinas, cursor, rótulos e relógio.
let textoRelogio = '';
function animarCena(dt) {
  ambiente.atualizar(dt);
  cameraJogo.atualizar(dt, jogador.position);
  animarEsteiras(dt);
  for (const m of maquinas) animarMaquina(m, dt, m.luz.userData.estado === 'produzindo');
  const f = jogador.userData.frente;
  const cx = Math.round(jogador.position.x + f.x * 1.5);
  const cz = Math.round(jogador.position.z + f.z * 1.5);
  if (Math.abs(cx) <= 11 && Math.abs(cz) <= 11) cursor.mostrar(cx, cz, cabeAqui(cx, cz));
  else cursor.esconder();
  rotulos.atualizar();
  const texto = ambiente.texto();
  if (texto !== textoRelogio) {
    textoRelogio = texto;
    elRelogio.textContent = texto;
  }
}

const relogio = new THREE.Timer();
// ===== Salvamento =====

function salvarJogo() {
  return gravar(
    montarSave({
      economia: exportarEconomia(),
      estoque: exportarEstoque(),
      escolha: exportarEscolha(),
      contratos: exportarQuadro(quadro),
      caixas,
      relogio: ambiente.exportar(),
      jogador: jogador.position,
      maquinas,
      funcionarios: funcionarios.map((f) => f.malha.position),
    }),
  );
}

// Recria a oficina a partir do save: máquinas com saída, esteira e automação, funcionários e jogador.
function restaurarJogo() {
  const save = carregar(undefined, { capacidade: CAPACIDADE_SAIDA, maxFuncionarios: LIMITE_FUNCIONARIOS });
  if (!save) return false;
  importarEconomia(save.economia);
  importarEstoque(save.estoque, produtoPorChave);
  importarEscolha(save.escolha);
  quadro = importarQuadro(save.contratos, produtoPorChave);
  caixas = save.caixas;
  ambiente.importar(save.relogio);
  for (const dados of save.maquinas) {
    if (!cabeAqui(dados.x, dados.z)) continue;
    const maquina = criarMaquina(dados.x, dados.z);
    cena.add(maquina.malha);
    maquinas.push(maquina);
    rotularMaquina(maquina);
    registrarObstaculo(dados.x - 0.45, dados.x + 0.45, dados.z - 0.45, dados.z + 0.45);
    for (const chave of dados.saida) {
      const produto = produtoPorChave(chave);
      if (produto) cena.add(criarCaixa(maquina, produto));
    }
    if (dados.esteira) {
      maquina.esteira = criarEsteira(maquina, ESTOQUE_PONTO);
      cena.add(maquina.esteira);
    }
    const produto = dados.produto && produtoPorChave(dados.produto);
    if (dados.automatica && produto) {
      programar(maquina, produto);
      marcarAutomatica(maquina);
    }
  }
  for (const pos of save.funcionarios) {
    const f = criarFuncionario(pos.x, pos.z);
    cena.add(f.malha);
    funcionarios.push(f);
  }
  jogador.position.set(save.jogador.x, 0, save.jogador.z);
  return true;
}

// Novo jogo: apertar N duas vezes em 3 segundos apaga o save e recomeça.
let pedidoNovoJogo = 0;
function novoJogo() {
  const agora = performance.now();
  if (agora - pedidoNovoJogo > 3000) {
    pedidoNovoJogo = agora;
    mensagem('Aperte N de novo para apagar o progresso e recomeçar.');
    return;
  }
  salvarAoSair = false;
  clearInterval(timerSalvamento);
  apagar();
  location.reload();
}

let salvarAoSair = true;
const INTERVALO_SALVAMENTO = 5000; // ms
const timerSalvamento = setInterval(() => salvarAoSair && salvarJogo(), INTERVALO_SALVAMENTO);
window.addEventListener('pagehide', () => salvarAoSair && salvarJogo());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && salvarAoSair) salvarJogo();
});

if (restaurarJogo()) mensagem('Progresso carregado.');

renderer.setAnimationLoop(() => {
  relogio.update();
  const dt = Math.min(relogio.getDelta(), 0.05);
  atualizarJogador(jogador, teclas, dt, cameraJogo.giro);
  for (const f of funcionarios) atualizarFuncionario(f, dt, maquinas, acoesFuncionario);
  atualizarAutomacao(maquinas, dt, acoesLinha);
  avancarContratos(dt);
  atualizarLuzes();
  animarCena(dt);
  renderer.render(cena, camera);
});

atualizarPlacar();
mostrarContratos();
