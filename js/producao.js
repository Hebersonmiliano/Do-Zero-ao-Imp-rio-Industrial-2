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
  // saída: caixas prontas, ainda não levadas ao estoque; esteira: transporte automático até o estoque
  return { x, z, malha, saida: [], esteira: null, cronometro: 0 };
}

// Desenha uma esteira reta da máquina até o destino. Devolve a malha para a cena.
export function criarEsteira(maquina, destino) {
  const dx = destino.x - maquina.x;
  const dz = destino.z - maquina.z;
  const comprimento = Math.hypot(dx, dz);
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(comprimento, 0.08, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x555f66 }),
  );
  malha.position.set((maquina.x + destino.x) / 2, 0.04, (maquina.z + destino.z) / 2);
  malha.rotation.y = -Math.atan2(dz, dx);
  malha.receiveShadow = true;
  return malha;
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
