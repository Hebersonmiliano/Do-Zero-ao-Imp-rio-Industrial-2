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

export function quantidadeDe(chave) {
  return itens.get(chave)?.quantidade ?? 0;
}

// Retira caixas de um produto exato (entrega de contrato). Devolve false sem mexer se faltar.
export function retirar(chave, quantidade) {
  const item = itens.get(chave);
  if (!item || item.quantidade < quantidade) return false;
  item.quantidade -= quantidade;
  if (item.quantidade === 0) itens.delete(chave);
  return true;
}

// Vende todo o estoque, menos os produtos reservados para contratos. Devolve o valor em R$.
export function venderTudo(reservadas = new Set()) {
  let valor = 0;
  for (const [chave, item] of [...itens.entries()]) {
    if (reservadas.has(chave)) continue;
    valor += item.quantidade * item.valor;
    itens.delete(chave);
  }
  return valor;
}
