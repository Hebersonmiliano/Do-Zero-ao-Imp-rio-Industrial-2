// Máquinas e saída de caixas. A produção é manual: o jogador usa a máquina para fabricar uma caixa do produto escolhido.
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
  return { x, z, malha, saida: [] }; // saída: caixas prontas, ainda não levadas ao estoque
}

// Cria a malha de uma caixa do produto sobre a saída da máquina, empilhando em camadas de 4.
export function criarCaixa(maquina, produto) {
  const n = maquina.saida.length;
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(0.4 * produto.escala, 0.3 * produto.altura, 0.4 * produto.escala),
    new THREE.MeshStandardMaterial({ color: produto.cor }),
  );
  malha.position.set(
    maquina.x + ((n % 2) - 0.5) * 0.45,
    1.15 + Math.floor(n / 4) * 0.3,
    maquina.z + (((n >> 1) % 2) - 0.5) * 0.45,
  );
  malha.castShadow = true;
  maquina.saida.push({ malha, produto });
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
