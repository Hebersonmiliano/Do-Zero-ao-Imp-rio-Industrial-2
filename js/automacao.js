// Automação (v0.4): máquinas automáticas, limite da saída e transporte pelas esteiras.
// Só regras: não importa o Three.js. A cena entra pelas funções de "acoes".

export const CUSTO_AUTOMACAO = 100; // R$ para tornar uma máquina automática
export const CAPACIDADE_SAIDA = 8; // caixas que cabem na saída de uma máquina
export const TEMPO_AUTOMATICO = 3; // segundos por caixa numa máquina automática
export const INTERVALO_ESTEIRA = 1.2; // segundos entre duas caixas colocadas na esteira
export const VELOCIDADE_ESTEIRA = 1.5; // unidades por segundo

export function saidaCheia(maquina) {
  return maquina.saida.length >= CAPACIDADE_SAIDA;
}

// Situação da máquina, usada na luz do topo e no HUD.
// manual: sem automação · produzindo · sem-dinheiro: falta papelão · cheia: saída lotada, linha parada.
export function estadoMaquina(maquina, podePagar) {
  if (saidaCheia(maquina)) return 'cheia';
  if (!maquina.automatica) return 'manual';
  return podePagar ? 'produzindo' : 'sem-dinheiro';
}

// Torna a máquina automática ou, se já for, troca o produto programado.
export function programar(maquina, produto) {
  const nova = !maquina.automatica;
  maquina.automatica = true;
  maquina.produto = produto;
  maquina.cronometroProducao = 0;
  return nova;
}

// Avança a linha em dt segundos.
// acoes: podePagar(), produzir(maquina, produto), posicionar(item, maquina, progresso 0..1), entregar(item)
export function atualizarAutomacao(maquinas, dt, acoes) {
  for (const m of maquinas) {
    // Produção automática: para quando a saída enche ou falta dinheiro para o papelão.
    if (m.automatica) {
      if (saidaCheia(m) || !acoes.podePagar()) {
        m.cronometroProducao = Math.min(m.cronometroProducao ?? 0, TEMPO_AUTOMATICO);
      } else {
        m.cronometroProducao = (m.cronometroProducao ?? 0) + dt;
        if (m.cronometroProducao >= TEMPO_AUTOMATICO) {
          m.cronometroProducao = 0;
          acoes.produzir(m, m.produto);
        }
      }
    }

    if (!m.esteira) continue;
    m.transito ??= [];

    // A esteira pega a caixa do topo da pilha em intervalos fixos: é o limite de vazão da linha.
    m.cronometroEsteira = (m.cronometroEsteira ?? 0) + dt;
    if (m.saida.length > 0 && m.cronometroEsteira >= INTERVALO_ESTEIRA) {
      m.cronometroEsteira = 0;
      const item = m.saida.pop();
      item.progresso = 0;
      m.transito.push(item);
    } else if (m.saida.length === 0) {
      m.cronometroEsteira = Math.min(m.cronometroEsteira, INTERVALO_ESTEIRA);
    }

    // Caixas em trânsito andam até o estoque.
    const comprimento = Math.max(m.comprimentoEsteira ?? 1, 0.1);
    for (const item of [...m.transito]) {
      item.progresso += (VELOCIDADE_ESTEIRA * dt) / comprimento;
      if (item.progresso >= 1) {
        m.transito.splice(m.transito.indexOf(item), 1);
        acoes.entregar(item);
      } else {
        acoes.posicionar(item, m, item.progresso);
      }
    }
  }
}
