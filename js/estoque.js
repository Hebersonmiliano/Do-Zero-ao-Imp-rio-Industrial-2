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

// Salvamento: lista de [chave do produto, quantidade].
export function exportarEstoque() {
  return [...itens.entries()].map(([chave, item]) => [chave, item.quantidade]);
}

// Restaura o estoque. produtoPorChave reconstrói nome e valor pelo catálogo atual; chaves desconhecidas são ignoradas.
export function importarEstoque(lista, produtoPorChave) {
  itens.clear();
  for (const [chave, quantidade] of Array.isArray(lista) ? lista : []) {
    const produto = produtoPorChave(chave);
    const q = Math.floor(quantidade);
    if (produto && q > 0) guardarNoEstoque(produto, q);
  }
}

// Esvazia o estoque e devolve quanto ele vale em R$.
export function venderTudo() {
  let valor = 0;
  for (const item of itens.values()) valor += item.quantidade * item.valor;
  itens.clear();
  return valor;
}

// Retira uma quantidade de caixas, começando pelas mais caras. Devolve o valor retirado, ou 0 se faltar estoque.
export function retirarPedido(quantidade) {
  if (totalNoEstoque() < quantidade) return 0;
  const ordenados = [...itens.entries()].sort((a, b) => b[1].valor - a[1].valor);
  let restante = quantidade;
  let valor = 0;
  for (const [chave, item] of ordenados) {
    const tirar = Math.min(restante, item.quantidade);
    item.quantidade -= tirar;
    valor += tirar * item.valor;
    restante -= tirar;
    if (item.quantidade === 0) itens.delete(chave);
    if (restante === 0) break;
  }
  return valor;
}
