# Do Zero ao Império Industrial 2 — Distrito Industrial

Documento de projeto. Última revisão: 2026-10-27.

## Visão geral

O Império Industrial 2 é uma simulação de gestão e construção de fábrica em 3D. O jogador começa numa oficina alugada em um bairro industrial e termina com um grupo industrial com fábricas em várias regiões.

O jogo é uma sequência do Império Industrial 3D, mas é um projeto separado, com outro ambiente, outra câmera e sistemas mais profundos. O primeiro jogo continua intacto.

Público: jogadores do primeiro jogo e fãs de gestão e construção de fábricas que querem uma simulação maior.

## Pilares de design

1. **Construir antes de gerenciar.** O jogador desenha a fábrica e cada expansão aparece no cenário.
2. **Gargalos visíveis.** Esteiras, filas e funcionários mostram onde a produção trava.
3. **Começar pequeno.** A oficina começa com pouco dinheiro e pouco espaço.
4. **Reinvestir cada venda.** Cada lucro vira máquina, terreno, funcionário ou contrato.
5. **Humor leve e sensação de conquista.** A série mantém o tom do primeiro jogo.

| Mantém do 1 | Muda no 2 |
| --- | --- |
| Início com pouco dinheiro | Ambiente: bairro industrial explorável |
| Produção manual no início | Câmera com rotação e zoom |
| Caixas de papelão como primeira produção | Construção e posicionamento livres |
| Funcionários trabalhando no cenário | Várias linhas e tipos de embalagem |
| Evolução visual forte | Expansões construídas pelo jogador |

## Ambiente: Distrito Industrial

O jogo se passa no Distrito Industrial, um bairro industrial vivo com ruas, concorrentes, lojas, terrenos à venda e um centro de distribuição. O jogador começa em uma oficina alugada e constrói a fábrica dentro de um terreno aberto.

**Começo do jogo:** mesa de montagem, computador antigo para receber pedidos, bicicleta ou pequena van para entregas, pouco espaço de estoque, rua visível pela porta aberta e clientes que chegam pessoalmente.

**Câmera:** rotação e zoom livres, controlados pelo jogador. A câmera ortográfica fixa do primeiro jogo não será reaproveitada.

**Paleta:** azul-petróleo, laranja industrial e cinza-concreto como cores principais. A luz natural muda ao longo do dia. Placas luminosas mostram o nome da empresa.

**Evolução visual do mapa:**

1. Oficina alugada em um bairro pequeno.
2. Compra do primeiro terreno industrial.
3. Construção do galpão próprio.
4. Expansão com setores de produção e estoque.
5. Compra dos terrenos vizinhos.
6. Centro de distribuição e frota de caminhões.
7. Rede de fábricas em diferentes regiões.

Chaminés, caixas-d’água e silos aparecem conforme a fábrica cresce. Caminhões levam a marca escolhida pelo jogador.

## Sistemas de jogo

Cada sistema tem uma fase de entrada. Os sistemas se alimentam: a qualidade afeta a reputação, e a reputação define os contratos.

| Sistema | O que o jogador faz | Entra na fase |
| --- | --- | --- |
| Produtos | Cria caixas com tamanho, cor, material e reforço | 2 Oficina |
| Funcionários | Contrata pessoas com profissão e experiência, define tarefas | 3 Pequena fábrica |
| Construção | Posiciona máquinas, esteiras, depósitos e paredes livremente | 3 Pequena fábrica |
| Linhas de produção | Monta linhas com máquinas configuráveis e rotas de materiais | 4 Automação |
| Clientes e contratos | Atende pedidos, negocia prazos e preços, cumpre contratos | 5 Complexo |
| Reputação | Ganha ou perde confiança conforme entregas e qualidade | 5 Complexo |
| Qualidade | Inspeciona produtos e separa os defeituosos | 5 Complexo |
| Manutenção e energia | Mantém máquinas funcionando e controla consumo e emissões | 5 Complexo |
| Veículos e entregas | Usa vans e caminhões em rotas no mapa da cidade | 6 Rede regional |
| Concorrência e mercado | Enfrenta concorrentes com preços que variam conforme a oferta | 6 Rede regional |
| Pesquisa e exportação | Desbloqueia tecnologias e vende para outros países | 8 Império global |

**Gargalos:** esteiras, filas e funcionários ocupados aparecem no cenário para o jogador localizar o problema.

## Progressão por fases

Oito fases. Cada uma adiciona um local e sistemas novos. Os valores exatos de cada gatilho serão definidos no balanceamento.

| Fase | Local | O que o jogador faz | Gatilho para avançar |
| --- | --- | --- | --- |
| 1. Garagem | Oficina alugada | Produz caixas simples à mão | Vender as primeiras caixas |
| 2. Oficina | Oficina ampliada | Produz caixas coloridas, reforçadas e de presente | Ter produtos com reforço e cor |
| 3. Pequena fábrica | Primeiro terreno industrial | Contrata funcionários e compra as primeiras máquinas | Manter funcionários ocupados |
| 4. Indústria automatizada | Galpão próprio | Monta esteiras e linhas configuráveis | Linha automatizada estável |
| 5. Complexo industrial | Terrenos vizinhos | Organiza setores, depósitos e veículos | Atender contratos de clientes |
| 6. Rede regional | Centro de distribuição | Faz entregas com frota e atende clientes fixos | Reputação regional alta |
| 7. Grupo industrial | Várias regiões | Administra fábricas especializadas | Gerenciar duas ou mais fábricas |
| 8. Império global | Mercado de exportação | Exporta, pesquisa tecnologias e fecha grandes contratos | Vitória da campanha |

## Arquitetura técnica

```
Interface ──comandos──▶ Núcleo ──salvar──▶ Persistência
                         │
                 ┌───────┴───────┐
                 ▼               ▼
              Fábrica ◀─tarefas─▶ Pessoas e veículos
                 │               │
                 └───────┬───────┘
                         ▼
                      Mundo 3D
```

- **Interface:** HUD, menus e construção.
- **Núcleo:** estado da empresa, tempo e economia.
- **Persistência:** salvamento versionado.
- **Fábrica:** produção e qualidade.
- **Pessoas e veículos:** funcionários, clientes e caminhões.
- **Mundo 3D:** bairro, câmera e luz.

Regras:

- O núcleo é a única fonte de verdade do estado.
- Os sistemas não alteram a cena diretamente; a cena lê o estado.
- O tempo da simulação é separado do quadro de renderização.
- O save é versionado e tem migração entre versões.

Stack atual: Three.js 0.186.1 com módulos ES, sem etapa de build. A decisão sobre bundler e TypeScript continua em aberto.

## Roteiro de versões

Cada versão só começa quando a anterior cumpre o critério de pronto.

| Versão | Entrega | Critério de pronto | Fases cobertas |
| --- | --- | --- | --- |
| v0.1 | Movimentação, construção e produção básica | Jogador anda, posiciona uma máquina e produz uma caixa | 1 |
| v0.2 | Catálogo de caixas e estoque separado | Caixas com tamanho, cor e material escolhidos; estoque separado da produção | 1 e 2 |
| v0.3 | Funcionários e tarefas | Funcionário executa transporte sem intervenção do jogador | 3 |
| v0.4 | Máquinas, esteiras e automação | Linha completa roda sem o jogador | 4 |
| v0.5 | Clientes, contratos e reputação | Contrato aceito, entregue, e a reputação muda | 5 |
| v0.6 | Qualidade, manutenção e energia | Defeitos separados; máquina quebra e exige manutenção; consumo visível | 5 |
| v0.7 | Veículos e mapa de entregas | Van sai da fábrica com rota no mapa | 6 |
| v0.8 | Decoração e construção avançada | Terreno comprado e escritório decorado | 5 a 7 |
| v0.9 | Campanha, balanceamento e otimização | Campanha de oito fases jogável do início ao fim | 1 a 8 |
| v1.0 | Lançamento completo | Várias fábricas, exportação e save estável nos testes | 7 e 8 |

## Decisões

Decididas em 2026-10-27, antes da v0.1:

- [x] Posicionamento: grade com snap de 1 unidade. Colisão e rotas ficam simples.
- [x] Câmera: fixa na v0.1. Rotação e zoom entram na v0.8.
- [x] Stack: Three.js 0.186.1 com módulos ES, sem bundler.
- [x] Ferramentas: JavaScript puro. TypeScript e bundler só se o código pedir.
- [x] Trânsito: decorativo até a v0.7, quando entram os veículos de entrega.
- [x] Nome: “Distrito Industrial” como subtítulo oficial.

## Estado de implementação

| Versão | Situação | O que existe no jogo |
| --- | --- | --- |
| v0.1 | Concluída | Movimentação na grade, posicionamento de máquina (tecla B) e produção manual de caixas (tecla E). |
| v0.2 | Concluída | Catálogo com tamanho, cor e material (teclas T, C e M) e estoque separado da saída das máquinas (tecla R). |
| Primeira versão jogável | Concluída | Economia com R$ 100 iniciais, expedição para vender (tecla V), pedidos de cliente com bônus e meta de R$ 1.000 em vendas. |
| v0.3 | Concluída | Até 3 funcionários (tecla F) escolhem tarefas sozinhos: produzem nas máquinas manuais e levam a saída ao estoque. |
| v0.4 | Concluída | Esteiras (tecla L) e máquinas automáticas (tecla U). A linha roda sem o jogador e os gargalos aparecem na luz das máquinas. |
| Cenário | Concluído | Personagem com colete e capacete, bairro com rua, calçadas, prédios vizinhos e árvores. |

Ainda não existem: salvamento, câmera com rotação e zoom, clientes no cenário, contratos com prazo, reputação e qualidade.

### v0.4 em detalhe

- **Máquina automática:** custa R$ 100 (tecla U perto da máquina). Fabrica sozinha uma caixa a cada 3 segundos, pagando R$ 2 de papelão por caixa. O produto é o escolhido no catálogo no momento da automação; apertar U de novo reprograma a máquina para a caixa atual, sem custo.
- **Esteira:** custa R$ 40 (tecla L). Pega a caixa do topo da saída a cada 1,2 segundo e a leva até a prateleira do estoque a 1,5 unidade por segundo. As caixas aparecem andando sobre a esteira.
- **Limite da saída:** cada máquina guarda até 8 caixas. Com a saída cheia, a máquina para e não gasta papelão. A produção manual (E) e a dos funcionários também respeitam o limite.
- **Luz de situação:** cinza (manual), verde (produzindo), amarela (sem dinheiro para papelão) e vermelha (saída cheia). O HUD resume a linha: máquinas automáticas, produzindo, paradas e sem papelão.
- **Funcionários:** ignoram máquinas automáticas na hora de produzir e não recolhem a saída de máquinas com esteira, porque a linha já cuida delas.
- **Critério de pronto atendido:** uma máquina automática com esteira enche o estoque sem nenhuma ação do jogador. Isso é verificado em `testes/automacao.test.mjs`.

### Pendências conhecidas

- A esteira vai em linha reta da máquina até a prateleira e pode atravessar a oficina. Rotas com curvas entram junto com a construção de esteiras por peças.
- O tempo da simulação ainda segue o quadro de renderização, com passo máximo de 0,05 segundo. Em aparelhos muito lentos o jogo inteiro fica mais lento. A arquitetura pede tempo de simulação separado.
- Recarregar a página perde o progresso até o salvamento ser implementado.

## Economia atual

Todos os valores estão em `js/economia.js`, `js/automacao.js` e `js/catalogo.js`.

| Item | Valor |
| --- | --- |
| Dinheiro inicial | R$ 100 |
| Papelão por caixa | R$ 2 |
| Máquina | R$ 60 |
| Funcionário | R$ 80 (máximo de 3) |
| Esteira | R$ 40 |
| Automação de máquina | R$ 100 |
| Meta da campanha | R$ 1.000 em vendas |
| Primeiro pedido | 5 caixas, bônus de R$ 30. Cada pedido cumprido soma 3 caixas e R$ 20 ao seguinte |

| Caixa | Papelão simples | Reforçado |
| --- | --- | --- |
| Pequena | R$ 6 | R$ 12 |
| Média | R$ 10 | R$ 20 |
| Grande | R$ 16 | R$ 32 |

A cor muda só a aparência. Uma máquina automática produz 20 caixas por minuto de jogo; com caixas grandes reforçadas isso vale R$ 640 por minuto, ou R$ 600 descontado o papelão.

## Próximo passo

v0.5 — Clientes, contratos e reputação: clientes que chegam à oficina com pedidos de produto, quantidade e prazo; reputação que sobe ou cai conforme as entregas. Antes dela, o salvamento versionado é recomendado, porque partidas com linha automática ficam longas.

## Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Escopo grande demais | Atraso e jogo incompleto | Versões pequenas com critério de pronto |
| Muitos funcionários e veículos ao mesmo tempo | Queda de quadros por segundo | Limite de agentes ativos e simulação em lotes |
| Balanceamento da economia | Jogo fácil ou travado | Constantes em um arquivo e testes de campanha na v0.9 |
| Perda de identidade da série | Jogador não reconhece a sequência | Manter tom de humor, início com pouco dinheiro e evolução visual |
| Save inconsistente | Perda de progresso | Save versionado com migração entre versões |

## Referências

- Primeiro jogo: [github.com/Hebersonmiliano/imperio-industrial-3d](https://github.com/Hebersonmiliano/imperio-industrial-3d)
