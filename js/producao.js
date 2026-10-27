// Máquinas e saída de caixas. A produção começa manual; a partir da v0.4 a máquina pode ser automática (automacao.js).
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
  // Luz de situação no topo: cinza (manual), verde, amarela ou vermelha (ver CORES_LUZ).
  const luz = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 8),
    new THREE.MeshStandardMaterial({ color: CORES_LUZ.manual, emissive: 0x000000 }),
  );
  luz.position.set(0.32, 0.56, 0.32);
  malha.add(luz);
  // saída: caixas prontas, ainda não levadas ao estoque; esteira: transporte automático até o estoque
  return {
    x, z, malha, luz, saida: [], esteira: null, comprimentoEsteira: 0, transito: [],
    automatica: false, produto: null, cronometroProducao: 0, cronometroEsteira: 0,
  };
}

export const CORES_LUZ = {
  manual: 0x6b7378,
  produzindo: 0x3cc46a,
  'sem-dinheiro': 0xf2c230,
  cheia: 0xe0453a,
};

// Pinta a luz da máquina conforme a situação (estadoMaquina, em automacao.js).
export function mostrarEstado(maquina, estado) {
  if (maquina.luz.userData.estado === estado) return;
  maquina.luz.userData.estado = estado;
  const cor = CORES_LUZ[estado];
  maquina.luz.material.color.setHex(cor);
  maquina.luz.material.emissive.setHex(estado === 'manual' ? 0x000000 : cor);
  maquina.luz.material.emissiveIntensity = 0.8;
}

// Braço laranja sobre a máquina: marca visual de máquina automática.
export function marcarAutomatica(maquina) {
  if (maquina.malha.userData.braco) return;
  const braco = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.12, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xf28c28 }),
  );
  braco.position.set(-0.05, 0.62, -0.2);
  braco.castShadow = true;
  maquina.malha.add(braco);
  maquina.malha.userData.braco = braco;
}

// Posição de uma caixa na esteira: progresso 0 na máquina, 1 no estoque.
export function posicionarNaEsteira(malha, maquina, progresso) {
  const d = maquina.destinoEsteira;
  malha.position.set(
    maquina.x + (d.x - maquina.x) * progresso,
    0.08 + malha.geometry.parameters.height / 2,
    maquina.z + (d.z - maquina.z) * progresso,
  );
}

// Desenha uma esteira reta da máquina até o destino. Devolve a malha para a cena.
export function criarEsteira(maquina, destino) {
  const dx = destino.x - maquina.x;
  const dz = destino.z - maquina.z;
  const comprimento = Math.hypot(dx, dz);
  maquina.comprimentoEsteira = comprimento;
  maquina.destinoEsteira = { x: destino.x, z: destino.z };
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
