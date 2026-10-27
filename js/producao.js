// Máquinas e caixas produzidas. Na v0.1 a produção é manual: o jogador usa a máquina para fabricar uma caixa.
import * as THREE from 'three';

const ALCANCE = 1.8; // distância máxima do jogador para usar uma máquina

export function criarMaquina(x, z) {
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1f4e5a }),
  );
  malha.position.set(x, 0.5, z);
  malha.castShadow = true;
  malha.receiveShadow = true;
  return { x, z, malha, caixas: [] };
}

// Cria a malha de uma caixa nova sobre a máquina, empilhando em camadas de 4.
export function criarCaixa(maquina) {
  const n = maquina.caixas.length;
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xc89b5a }),
  );
  malha.position.set(
    maquina.x + ((n % 2) - 0.5) * 0.45,
    1.15 + Math.floor(n / 4) * 0.3,
    maquina.z + (((n >> 1) % 2) - 0.5) * 0.45,
  );
  malha.castShadow = true;
  maquina.caixas.push(malha);
  return malha;
}

// Devolve a máquina mais próxima dentro do alcance, ou null.
export function maquinaProxima(posicao, maquinas) {
  let melhor = null;
  let melhorDistancia = ALCANCE;
  for (const m of maquinas) {
    const distancia = Math.hypot(posicao.x - m.x, posicao.z - m.z);
    if (distancia <= melhorDistancia) {
      melhor = m;
      melhorDistancia = distancia;
    }
  }
  return melhor;
}
