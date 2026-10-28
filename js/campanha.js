// Campanha do Distrito: oito marcos cumulativos usando os sistemas jogáveis.
export const ETAPAS = [
  { nome: 'Primeiras vendas', objetivo: 'Venda R$ 60 em caixas', campo: 'vendido', meta: 60 },
  { nome: 'Oficina produtiva', objetivo: 'Produza 30 caixas', campo: 'caixas', meta: 30 },
  { nome: 'Primeira equipe', objetivo: 'Contrate um funcionário', campo: 'funcionarios', meta: 1 },
  { nome: 'Linha automática', objetivo: 'Tenha uma máquina automática com esteira', campo: 'linhas', meta: 1 },
  { nome: 'Clientes satisfeitos', objetivo: 'Cumpra 5 contratos', campo: 'cumpridos', meta: 5 },
  { nome: 'Entregas no distrito', objetivo: 'Conclua 10 viagens de entrega', campo: 'entregas', meta: 10 },
  { nome: 'Complexo próprio', objetivo: 'Construa terreno, escritório e fachada', campo: 'propriedade', meta: 3 },
  { nome: 'Referência industrial', objetivo: 'Alcance R$ 5.000 em vendas', campo: 'vendido', meta: 5000 },
];

export function avaliarCampanha(dados, anterior = 0) {
  let concluidas = Math.max(0, Math.min(ETAPAS.length, Math.floor(anterior) || 0));
  while (concluidas < ETAPAS.length) {
    const etapa = ETAPAS[concluidas];
    if ((dados[etapa.campo] ?? 0) < etapa.meta) break;
    concluidas++;
  }
  const etapa = ETAPAS[concluidas] ?? null;
  return { concluidas, etapa, progresso: etapa ? Math.min(1, Math.max(0, (dados[etapa.campo] ?? 0) / etapa.meta)) : 1, venceu: !etapa };
}

