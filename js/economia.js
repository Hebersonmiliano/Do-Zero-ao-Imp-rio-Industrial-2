// Economia da primeira campanha: dinheiro, custos e meta de vendas.

export const DINHEIRO_INICIAL = 100; // R$
export const CUSTO_PRODUCAO = 2; // R$ de papelão por caixa produzida
export const CUSTO_MAQUINA = 60; // R$ por máquina posicionada
export const CUSTO_FUNCIONARIO = 80; // R$ para contratar um funcionário
export const CUSTO_ESTEIRA = 40; // R$ para ligar a saída de uma máquina ao estoque
export const META_VENDAS = 1000; // R$ em vendas para vencer a campanha

let dinheiro = DINHEIRO_INICIAL;
let vendido = 0;
let pedido = { quantidade: 5, bonus: 30 }; // próximo pedido de cliente: caixas pedidas e bônus em R$
let pedidosCumpridos = 0;

export function getPedido() {
  return pedido;
}

export function getPedidosCumpridos() {
  return pedidosCumpridos;
}

// Registra o pedido cumprido: devolve o bônus e prepara um pedido maior.
export function cumprirPedido() {
  const bonus = pedido.bonus;
  pedidosCumpridos += 1;
  pedido = { quantidade: pedido.quantidade + 3, bonus: pedido.bonus + 20 };
  return bonus;
}

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
