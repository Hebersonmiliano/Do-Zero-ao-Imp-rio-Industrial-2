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

## Decisões em aberto

Estas decisões precisam ser tomadas antes da v0.1.

- [ ] Posicionamento: grade com snap ou livre? A grade simplifica colisão e rotas.
- [ ] Câmera: rotação e zoom entram na v0.1 ou depois?
- [ ] Stack: manter Three.js atual com módulos ES ou outra versão?
- [ ] Ferramentas: usar bundler e TypeScript ou manter JavaScript puro?
- [ ] Trânsito: ruas e carros serão simulados ou apenas decorativos?
- [ ] Nome: manter “Distrito Industrial” como subtítulo oficial?

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
