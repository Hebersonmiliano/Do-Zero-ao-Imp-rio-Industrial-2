// Cenário do bairro em volta da área de jogo: gramado, rua, prédios vizinhos e árvores.
// Tudo fica fora da grade jogável (|x| ou |z| maior que 12), então não bloqueia o jogador.
import * as THREE from 'three';

const COR = {
  grama: 0x7fa86a,
  asfalto: 0x3d4347,
  faixa: 0xf2efe6,
  calcada: 0xb8b2a6,
  tronco: 0x6b4f35,
  copa: 0x4f8a4a,
};

// Prédios vizinhos: posição, tamanho e cor.
const PREDIOS = [
  { x: -16, z: -14, w: 6, h: 8, d: 5, cor: 0xc9b99a },
  { x: 14, z: -16, w: 7, h: 6, d: 6, cor: 0x9fb3c2 },
  { x: -18, z: 6, w: 5, h: 10, d: 5, cor: 0xd6c7a8 },
  { x: 17, z: 8, w: 6, h: 7, d: 6, cor: 0xa9b8a0 },
];

const ARVORES = [
  { x: -14, z: -4 },
  { x: -14, z: 2 },
  { x: 13, z: -9 },
  { x: 12, z: 1 },
  { x: -6, z: 14 },
  { x: 4, z: 15 },
];

function caixa(w, h, d, cor, x, y, z) {
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: cor }),
  );
  malha.position.set(x, y, z);
  malha.castShadow = true;
  malha.receiveShadow = true;
  return malha;
}

function arvore(x, z) {
  const grupo = new THREE.Group();
  const tronco = caixa(0.4, 1.6, 0.4, COR.tronco, 0, 0.8, 0);
  const copa = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 14, 10),
    new THREE.MeshStandardMaterial({ color: COR.copa }),
  );
  copa.position.y = 2.6;
  copa.castShadow = true;
  grupo.add(tronco, copa);
  grupo.position.set(x, 0, z);
  return grupo;
}

// Adiciona o cenário à cena.
export function criarCenario(cena) {
  const gramado = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.MeshStandardMaterial({ color: COR.grama }),
  );
  gramado.rotation.x = -Math.PI / 2;
  gramado.position.y = -0.02;
  gramado.receiveShadow = true;
  cena.add(gramado);

  // Rua de asfalto passando ao sul da área de jogo, com faixa central tracejada e calçada.
  const rua = caixa(160, 0.02, 4, COR.asfalto, 0, 0.01, 15);
  cena.add(rua);
  cena.add(caixa(160, 0.03, 0.3, COR.calcada, 0, 0.02, 13.2));
  for (let x = -70; x <= 70; x += 3) {
    cena.add(caixa(1.4, 0.03, 0.12, COR.faixa, x, 0.03, 15));
  }

  for (const p of PREDIOS) {
    cena.add(caixa(p.w, p.h, p.d, p.cor, p.x, p.h / 2, p.z));
  }
  for (const a of ARVORES) {
    cena.add(arvore(a.x, a.z));
  }
}
