// Catálogo de caixas: tamanho, cor e material. A escolha atual define o que a máquina produz.

export const TAMANHOS = [
  { id: 'P', nome: 'Pequena', escala: 0.75 },
  { id: 'M', nome: 'Média', escala: 1 },
  { id: 'G', nome: 'Grande', escala: 1.3 },
];

export const CORES = [
  { nome: 'Parda', hex: 0xc89b5a },
  { nome: 'Azul', hex: 0x4f7fb8 },
  { nome: 'Vermelha', hex: 0xc0453b },
];

export const MATERIAIS = [
  { nome: 'Papelão simples', altura: 1 },
  { nome: 'Reforçado', altura: 1.4 },
];

const escolha = { tamanho: 0, cor: 0, material: 0 };
const listas = { tamanho: TAMANHOS, cor: CORES, material: MATERIAIS };

// Avança para a próxima opção do campo ('tamanho', 'cor' ou 'material'), dando a volta no fim.
export function ciclar(campo) {
  escolha[campo] = (escolha[campo] + 1) % listas[campo].length;
}

// Produto definido pela escolha atual: chave para o estoque, nome para a tela e aparência para a malha.
export function produtoAtual() {
  const t = TAMANHOS[escolha.tamanho];
  const c = CORES[escolha.cor];
  const m = MATERIAIS[escolha.material];
  return {
    chave: `${t.id}-${escolha.cor}-${escolha.material}`,
    nome: `${t.nome} ${c.nome.toLowerCase()}, ${m.nome.toLowerCase()}`,
    escala: t.escala,
    altura: m.altura,
    cor: c.hex,
  };
}
