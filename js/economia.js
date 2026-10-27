// Economia da primeira campanha: dinheiro, custos e meta de vendas.

export const DINHEIRO_INICIAL = 100; // R$
export const CUSTO_PRODUCAO = 2; // R$ de papelão por caixa produzida
export const CUSTO_MAQUINA = 60; // R$ por máquina posicionada
export const META_VENDAS = 1000; // R$ em vendas para vencer a campanha

let dinheiro = DINHEIRO_INICIAL;
let vendido = 0;

export function getDinheiro() {
  return dinheiro;
}

export function getVendido() {
  return vendido;
}

// Desconta o valor se houver dinheiro. Devolve false sem descontar nada caso contrário.
export function pagar(valor) {
  if (dinheiro < valor) return false;
  dinheiro -= valor;
  return true;
}

// Recebe uma venda da expedição.
export function receber(valor) {
  dinheiro += valor;
  vendido += valor;
}

export function venceu() {
  return vendido >= META_VENDAS;
}
