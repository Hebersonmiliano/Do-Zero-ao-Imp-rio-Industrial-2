// Jogador: malha, movimento com WASD ou setas e colisão com obstáculos da grade.
import * as THREE from 'three';
import { bloqueado, LIMITE } from './grade.js';

const VELOCIDADE = 4; // unidades por segundo

export function criarJogador(x, z) {
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.4, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xf28c28 }),
  );
  malha.position.set(x, 0.7, z);
  malha.castShadow = true;
  // Direção para onde o jogador olha (eixo dominante), usada para posicionar máquinas à frente.
  malha.userData.frente = { x: 0, z: 1 };
  return malha;
}

export function atualizarJogador(jogador, teclas, dt) {
  let dx = 0;
  let dz = 0;
  if (teclas.has('KeyA') || teclas.has('ArrowLeft')) dx -= 1;
  if (teclas.has('KeyD') || teclas.has('ArrowRight')) dx += 1;
  if (teclas.has('KeyW') || teclas.has('ArrowUp')) dz -= 1;
  if (teclas.has('KeyS') || teclas.has('ArrowDown')) dz += 1;
  if (dx === 0 && dz === 0) return;

  jogador.userData.frente = Math.abs(dx) >= Math.abs(dz)
    ? { x: Math.sign(dx), z: 0 }
    : { x: 0, z: Math.sign(dz) };

  // Normaliza a diagonal para não andar mais rápido.
  const tamanho = Math.hypot(dx, dz);
  const passo = (VELOCIDADE * dt) / tamanho;
  dx *= passo;
  dz *= passo;

  const p = jogador.position;
  // Move cada eixo separadamente para deslizar ao longo de obstáculos.
  if (!bloqueado(p.x + dx, p.z)) p.x = Math.max(-LIMITE, Math.min(LIMITE, p.x + dx));
  if (!bloqueado(p.x, p.z + dz)) p.z = Math.max(-LIMITE, Math.min(LIMITE, p.z + dz));
}
