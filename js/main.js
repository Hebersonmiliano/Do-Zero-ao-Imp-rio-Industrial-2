// Cena do Distrito Industrial: chão em grade, luz natural, oficina, jogador, máquinas, funcionários e linha automática.
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
} from './producao.js';
import {
  CAPACIDADE_SAIDA,
  CUSTO_AUTOMACAO,
  atualizarAutomacao,
  estadoMaquina,
  programar,
  saidaCheia,
} from './automacao.js';
import { ciclar, produtoAtual } from './catalogo.js';
import { guardarNoEstoque, totalNoEstoque, resumoEstoque, venderTudo, retirarPedido } from './estoque.js';
import { criarFuncionario, atualizarFuncionario, ESTOQUE_PONTO } from './funcionarios.js';
import { criarCenario } from './cenario.js';
import {
  CUSTO_ESTEIRA,
  CUSTO_FUNCIONARIO,
  CUSTO_MAQUINA,
  CUSTO_PRODUCAO,
  META_VENDAS,
  cumprirPedido,
  getDinheiro,
  getPedido,
  getPedidosCumpridos,
  getVendido,
  pagar,
  receber,
  venceu,
} from './economia.js';

const COR = {
  petroleo: 0x1f4e5a,
  laranja: 0xf28c28,
  concreto: 0x9aa3a8,
  ceu: 0xdfeaed,
};

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
const elPedido = document.getElementById('pedido');
const elPedidosCumpridos = document.getElementById('pedidos-cumpridos');
const elLinha = document.getElementById('linha');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
palco.appendChild(renderer.domElement);

const cena = new THREE.Scene();
cena.background = new THREE.Color(COR.ceu);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(18, 16, 18);
camera.lookAt(0, 0, 0);

// Luz natural: céu, sol e sombras.
cena.add(new THREE.HemisphereLight(0xffffff, COR.concreto, 1.2));
const sol = new THREE.DirectionalLight(0xffffff, 2);
sol.position.set(18, 30, 14);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26 });
cena.add(sol);

// Chão de concreto com grade de células de 1 unidade (linhas nos limites das células).
const chao = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.MeshStandardMaterial({ color: COR.concreto }),
);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
cena.add(chao);
criarCenario(cena);

const grade = new THREE.GridHelper(24, 24, COR.petroleo, COR.petroleo);
grade.material.transparent = true;
grade.material.opacity = 0.25;
grade.position.set(0.5, 0.01, 0.5);
cena.add(grade);

// Oficina inicial (placeholder): 5 x 3 células, centrada na origem.
const oficina = new THREE.Mesh(
  new THREE.BoxGeometry(5, 3, 3),
  new THREE.MeshStandardMaterial({ color: COR.petroleo }),
);
oficina.position.set(0, 1.5, 0);
oficina.castShadow = true;
oficina.receiveShadow = true;
cena.add(oficina);
registrarObstaculo(-2.5, 2.5, -1.5, 1.5);

// Placa com a cor de destaque da série.
const placa = new THREE.Mesh(
  new THREE.BoxGeometry(3, 0.5, 0.2),
  new THREE.MeshStandardMaterial({ color: COR.laranja }),
);
placa.position.set(0, 3.5, 2.1);
placa.castShadow = true;
cena.add(placa);

// Expedição: onde o estoque é vendido (tecla V, perto do ponto).
const EXPEDICAO = { x: -8, z: 4 };
const expedicao = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 2),
  new THREE.MeshStandardMaterial({ color: COR.laranja }),
);
expedicao.position.set(EXPEDICAO.x, 0.5, EXPEDICAO.z);
expedicao.castShadow = true;
expedicao.receiveShadow = true;
cena.add(expedicao);
registrarObstaculo(EXPEDICAO.x - 1, EXPEDICAO.x + 1, EXPEDICAO.z - 1, EXPEDICAO.z + 1);

// Prateleira do estoque: onde os funcionários depositam a saída das máquinas.
const prateleira = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1.2, 1),
  new THREE.MeshStandardMaterial({ color: COR.petroleo }),
);
prateleira.position.set(ESTOQUE_PONTO.x, 0.6, ESTOQUE_PONTO.z);
prateleira.castShadow = true;
prateleira.receiveShadow = true;
cena.add(prateleira);
registrarObstaculo(ESTOQUE_PONTO.x - 1, ESTOQUE_PONTO.x + 1, ESTOQUE_PONTO.z - 0.5, ESTOQUE_PONTO.z + 0.5);

const jogador = criarJogador(0, 4);
cena.add(jogador);

const maquinas = [];
const funcionarios = [];
const LIMITE_FUNCIONARIOS = 3;
let caixas = 0;

const teclas = new Set();
let timerMensagem = null;

function mensagem(texto) {
  elMensagem.textContent = texto;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => (elMensagem.textContent = ''), 2000);
}

function atualizarPlacar() {
  elCaixas.textContent = caixas;
  elMaquinas.textContent = maquinas.length;
  elProduto.textContent = produtoAtual().nome;
  elEstoque.textContent = totalNoEstoque();
  elDetalheEstoque.textContent = resumoEstoque();
  elDinheiro.textContent = getDinheiro();
  elMeta.textContent = `${getVendido()} de ${META_VENDAS}`;
  elFuncionarios.textContent = funcionarios.length;
  const pedido = getPedido();
  elPedido.textContent = `${pedido.quantidade} caixas (bônus R$ ${pedido.bonus})`;
  elPedidosCumpridos.textContent = getPedidosCumpridos();
  elLinha.textContent = resumoLinha();
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
  atualizarPlacar();
  mensagem(
    !jaVencida && venceu()
      ? `${texto} Meta de R$ ${META_VENDAS} atingida: campanha vencida!`
      : texto,
  );
}

// Na expedição: cumpre o pedido do cliente se houver caixas suficientes, senão vende todo o estoque.
function venderNaExpedicao() {
  const p = jogador.position;
  if (Math.hypot(p.x - EXPEDICAO.x, p.z - EXPEDICAO.z) > 2.2) {
    mensagem('Leve o estoque à expedição (laranja) para vender.');
    return;
  }
  const pedido = getPedido();
  const valorPedido = retirarPedido(pedido.quantidade);
  if (valorPedido > 0) {
    const bonus = cumprirPedido();
    registrarVenda(valorPedido + bonus, `Pedido cumprido: R$ ${valorPedido} + bônus de R$ ${bonus}.`);
    return;
  }
  const valor = venderTudo();
  if (valor === 0) {
    mensagem('Nada no estoque para vender.');
    return;
  }
  registrarVenda(valor, `Vendido por R$ ${valor}.`);
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

const relogio = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(relogio.getDelta(), 0.05);
  atualizarJogador(jogador, teclas, dt);
  for (const f of funcionarios) atualizarFuncionario(f, dt, maquinas, acoesFuncionario);
  atualizarAutomacao(maquinas, dt, acoesLinha);
  atualizarLuzes();
  renderer.render(cena, camera);
});

atualizarPlacar();
