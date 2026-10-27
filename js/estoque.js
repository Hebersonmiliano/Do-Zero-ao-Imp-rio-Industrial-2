// Estoque: caixas prontas guardadas separadas da saída das máquinas, agrupadas por produto.

const itens = new Map(); // chave do produto -> { nome, valor, quantidade }

export function guardarNoEstoque(produto, quantidade = 1) {
  const atual = itens.get(produto.chave) ?? { nome: produto.nome, valor: produto.valor, quantidade: 0 };
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

// Esvazia o estoque e devolve quanto ele vale em R$.
export function venderTudo() {
  let valor = 0;
  for (const item of itens.values()) valor += item.quantidade * item.valor;
  itens.clear();
  return valor;
}
