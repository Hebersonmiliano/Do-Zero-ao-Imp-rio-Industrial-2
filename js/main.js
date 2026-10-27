// Cena base do Distrito Industrial: chão, luz natural e a oficina inicial (placeholder).
import * as THREE from 'three';

const COR = {
  petroleo: 0x1f4e5a,
  laranja: 0xf28c28,
  concreto: 0x9aa3a8,
  ceu: 0xdfeaed,
};

const palco = document.getElementById('palco');

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

// Chão de concreto.
const chao = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({ color: COR.concreto }),
);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
cena.add(chao);

// Oficina inicial (placeholder: um volume que será substituído pelo modelo da oficina).
const oficina = new THREE.Mesh(
  new THREE.BoxGeometry(6, 3, 4),
  new THREE.MeshStandardMaterial({ color: COR.petroleo }),
);
oficina.position.set(0, 1.5, 0);
oficina.castShadow = true;
oficina.receiveShadow = true;
cena.add(oficina);

// Placa com a cor de destaque da série.
const placa = new THREE.Mesh(
  new THREE.BoxGeometry(3, 0.5, 0.2),
  new THREE.MeshStandardMaterial({ color: COR.laranja }),
);
placa.position.set(0, 3.5, 2.1);
placa.castShadow = true;
cena.add(placa);

function ajustarTamanho() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', ajustarTamanho);

renderer.setAnimationLoop(() => {
  renderer.render(cena, camera);
});
