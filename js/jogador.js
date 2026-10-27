// Jogador: malha, movimento com WASD ou setas e colisão com obstáculos da grade.
import * as THREE from 'three';
import { bloqueado, LIMITE } from './grade.js';

const VELOCIDADE = 4; // unidades por segundo

// Personagem do jogador: pessoa com colete laranja, para se destacar dos funcionários.
export function criarJogador(x, z) {
  const grupo = new THREE.Group();
  const colete = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.85, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xf28c28 }),
  );
  colete.position.y = 0.95;
  const pernas = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.36),
    new THREE.MeshStandardMaterial({ color: 0x2b2b3a }),
  );
  pernas.position.y = 0.25;
  const cabeca = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xe0b08a }),
  );
  cabeca.position.y = 1.6;
  const capacete = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xffffff }),
  );
  capacete.position.y = 1.66;
  for (const parte of [colete, pernas, cabeca, capacete]) parte.castShadow = true;
  grupo.add(colete, pernas, cabeca, capacete);
  grupo.position.set(x, 0, z);
  // Direção para onde o jogador olha (eixo dominante), usada para posicionar máquinas à frente.
  grupo.userData.frente = { x: 0, z: 1 };
  return grupo;
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
  // Gira a pessoa para a direção do movimento.
  jogador.rotation.y = Math.atan2(dx, dz);
}
