// Cena do Distrito Industrial: chão em grade, luz natural, oficina, jogador e máquinas (v0.1).
import * as THREE from 'three';
import { registrarObstaculo, cabeAqui } from './grade.js';
import { criarJogador, atualizarJogador } from './jogador.js';
import { criarMaquina, criarCaixa, maquinaProxima } from './producao.js';
import { ciclar, produtoAtual } from './catalogo.js';
import { guardarNoEstoque, totalNoEstoque, resumoEstoque } from './estoque.js';

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

const jogador = criarJogador(0, 4);
cena.add(jogador);

const maquinas = [];
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
  renderer.render(cena, camera);
});

atualizarPlacar();
