// Funcionários: andam até as máquinas, produzem caixas e levam a saída ao estoque, sem o jogador.
import * as THREE from 'three';
import { saidaCheia } from './automacao.js';

const VELOCIDADE = 2.5; // unidades por segundo
const PAUSA = 1; // segundos entre ações
export const ESTOQUE_PONTO = { x: -8, z: -6 }; // prateleira de estoque, na cena

export function criarFuncionario(x, z) {
  const grupo = new THREE.Group();
  const corpo = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.9, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x3a6f8a }),
  );
  corpo.position.y = 0.65;
  corpo.castShadow = true;
  const cabeca = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xe0b08a }),
  );
  cabeca.position.y = 1.4;
  cabeca.castShadow = true;
  grupo.add(corpo, cabeca);
  grupo.position.set(x, 0, z);
  return { malha: grupo, fase: null, alvo: null, espera: 0, carga: [] };
}

// Escolhe a próxima tarefa: recolher a saída de uma máquina sem esteira, ou produzir numa máquina manual com espaço.
// Máquinas automáticas produzem sozinhas, e as que têm esteira não precisam de transporte.
function escolherTarefa(f, maquinas, acoes) {
  const comSaida = maquinas.find((m) => m.saida.length > 0 && !m.esteira);
  if (comSaida) {
    f.fase = 'recolher';
    f.alvo = { pos: { x: comSaida.x, z: comSaida.z + 0.8 }, maquina: comSaida };
    return;
  }
  const destino = maquinas.find((m) => !m.automatica && !saidaCheia(m));
  if (destino && acoes.podeProduzir()) {
    f.fase = 'produzir';
    f.alvo = { pos: { x: destino.x, z: destino.z + 0.8 }, maquina: destino };
  }
}

// Anda em direção ao ponto. Devolve true quando chega.
function andarAte(f, pos, dt) {
  const p = f.malha.position;
  const dx = pos.x - p.x;
  const dz = pos.z - p.z;
  const distancia = Math.hypot(dx, dz);
  if (distancia < 0.05) return true;
  f.malha.rotation.y = Math.atan2(dx, dz);
  const passo = VELOCIDADE * dt;
  if (passo >= distancia) {
    p.x = pos.x;
    p.z = pos.z;
    return true;
  }
  p.x += (dx / distancia) * passo;
  p.z += (dz / distancia) * passo;
  return false;
}

// Executa a ação da fase atual quando o funcionário chega ao destino.
function executar(f, acoes) {
  if (f.fase === 'produzir') {
    acoes.produzir(f.alvo.maquina);
    f.espera = PAUSA;
    f.fase = null;
    f.alvo = null;
  } else if (f.fase === 'recolher') {
    f.carga = acoes.recolher(f.alvo.maquina);
    f.espera = PAUSA;
    if (f.carga.length > 0) {
      f.fase = 'estoque';
      f.alvo = { pos: ESTOQUE_PONTO };
    } else {
      f.fase = null;
      f.alvo = null;
    }
  } else if (f.fase === 'estoque') {
    acoes.depositar(f.carga);
    f.carga = [];
    f.espera = PAUSA;
    f.fase = null;
    f.alvo = null;
  }
}

// Avança o funcionário em dt segundos. acoes é o conjunto de funções da cena (produzir, recolher, depositar).
export function atualizarFuncionario(f, dt, maquinas, acoes) {
  if (f.espera > 0) {
    f.espera -= dt;
    return;
  }
  if (!f.alvo) escolherTarefa(f, maquinas, acoes);
  if (!f.alvo) return;
  if (andarAte(f, f.alvo.pos, dt)) executar(f, acoes);
}
