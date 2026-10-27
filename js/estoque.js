// Estoque: caixas prontas guardadas separadas da saída das máquinas, agrupadas por produto.

const itens = new Map(); // chave do produto -> { nome, quantidade }

export function guardarNoEstoque(produto, quantidade = 1) {
  const atual = itens.get(produto.chave) ?? { nome: produto.nome, quantidade: 0 };
  atual.quantidade += quantidade;
  itens.set(produto.chave, atual);
}

export function totalNoEstoque() {
  let total = 0;
  for (const item of itens.values()) total += item.quantidade;
  return total;
}

export function resumoEstoque() {
  if (itens.size === 0) return 'vazio';
  return [...itens.values()].map((i) => `${i.quantidade}× ${i.nome}`).join(' · ');
}
