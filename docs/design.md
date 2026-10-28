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
| v0.5.1 | Visual do Distrito (feita fora da ordem original) | Visual igual ou superior ao do primeiro jogo | — |
| v0.6 | Qualidade, manutenção e energia | Defeitos separados; máquina quebra e exige manutenção; consumo visível | 5 |
| v0.7 | Veículos e mapa de entregas | Van sai da fábrica com rota no mapa | 6 |
| v0.8 | Decoração e construção avançada | Terreno comprado e escritório decorado (a câmera com rotação e zoom já entrou na v0.5.1) | 5 a 7 |
| v0.9 | Campanha, balanceamento e otimização | Campanha de oito fases jogável do início ao fim | 1 a 8 |
| v1.0 | Lançamento completo | Várias fábricas, exportação e save estável nos testes | 7 e 8 |

## Decisões

Decididas em 2026-10-27, antes da v0.1:

- [x] Posicionamento: grade com snap de 1 unidade. Colisão e rotas ficam simples.
- [x] Câmera: fixa na v0.1. Rotação e zoom entraram na v0.5.1, antes do previsto (v0.8).
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
| v0.5 | Concluída | Seis tipos de clientes oferecem contratos com produto exato, quantidade, pagamento e prazo. Reputação de 0 a 100 libera clientes e aumenta pagamentos. Substitui o pedido genérico da primeira versão jogável. |
| v0.5.1 | Concluída | Visual do Distrito: modelos de oficina, máquinas, esteiras, estoque, doca e van; terreno cercado; ciclo de dia e noite; câmera com rotação e zoom; HUD e rótulos redesenhados. Sem mudança de regras. |
| v0.6 | Concluída | Desgaste, defeitos e quebra das máquinas; manutenção (K); inspeção manual e inspetor automático (I); devoluções em contratos; energia com tarifa por hora, conta diária e corte. |
| v0.6.1 | Concluída | Trilha sonora original adaptativa (dia e noite, camadas por intensidade) e efeitos sonoros, tudo sintetizado. |
| v0.6.2 | Concluída | Controle de Xbox e similares (Gamepad API, mapeamento padrão, vibração), barra de ações e menu de comandos clicáveis, ofertas clicáveis e dicas que alternam entre teclado e controle. |
| v0.6.3 | Concluída | Salvamento mais seguro: indicador, aviso de armazenamento bloqueado, cópia de segurança, armazenamento persistente e código do progresso para exportar e importar. |
| v0.7 | Concluída | Uma van carrega contratos na doca, percorre rotas com distância e trânsito, entrega e retorna; mapa no HUD mostra a viagem. |
| Salvamento | Concluído | Save versionado no navegador, automático a cada 5 segundos, com validação e espaço para migrações. Novo jogo com N duas vezes. |
| Cenário | Concluído | Personagem com colete e capacete, bairro com rua, calçadas, prédios vizinhos e árvores. |

Ainda não existem: clientes andando no cenário, negociação de prazo e preço, qualidade e manutenção.

### v0.4 em detalhe

- **Máquina automática:** custa R$ 100 (tecla U perto da máquina). Fabrica sozinha uma caixa a cada 3 segundos, pagando R$ 2 de papelão por caixa. O produto é o escolhido no catálogo no momento da automação; apertar U de novo reprograma a máquina para a caixa atual, sem custo.
- **Esteira:** custa R$ 40 (tecla L). Pega a caixa do topo da saída a cada 1,2 segundo e a leva até a prateleira do estoque a 1,5 unidade por segundo. As caixas aparecem andando sobre a esteira.
- **Limite da saída:** cada máquina guarda até 8 caixas. Com a saída cheia, a máquina para e não gasta papelão. A produção manual (E) e a dos funcionários também respeitam o limite.
- **Luz de situação:** cinza (manual), verde (produzindo), amarela (sem dinheiro para papelão) e vermelha (saída cheia). O HUD resume a linha: máquinas automáticas, produzindo, paradas e sem papelão.
- **Funcionários:** ignoram máquinas automáticas na hora de produzir e não recolhem a saída de máquinas com esteira, porque a linha já cuida delas.
- **Critério de pronto atendido:** uma máquina automática com esteira enche o estoque sem nenhuma ação do jogador. Isso é verificado em `testes/automacao.test.mjs`.

### Pendências conhecidas

- O tempo da simulação ainda segue o quadro de renderização, com passo máximo de 0,05 segundo. Em aparelhos muito lentos o jogo inteiro fica mais lento. A arquitetura pede tempo de simulação separado.

### v0.5 em detalhe

- **Ofertas:** a primeira chega logo no começo; depois, uma a cada 30 segundos de jogo, ou a cada 10 segundos se o quadro estiver vazio. Ficam até 3 no quadro, e cada uma some depois de 60 segundos sem aceite, sem penalidade.
- **Contrato:** pede um produto exato do catálogo (tamanho, cor e material), uma quantidade e um prazo. O pagamento por caixa é o preço da venda avulsa × a margem do cliente × (1 + reputação ÷ 200). Até 3 contratos ao mesmo tempo (teclas 1, 2 e 3 aceitam).
- **Entrega:** V na expedição carrega na van o contrato pronto com prazo mais curto. O prazo continua correndo durante a rota; o pagamento acontece na chegada e a van precisa voltar antes de outro despacho. Sem contrato pronto, V vende o estoque livre.
- **Prazo vencido:** multa de 25% do pagamento (sem deixar o dinheiro negativo) e −10 de reputação.
- **Reputação:** começa em 20 e vai de 0 a 100; +5 por entrega no prazo. Faixas: Bairro (0), Distrito (30), Regional (60) e Referência (85).
- **Critério de pronto atendido:** contrato aceito, entregue e a reputação muda. Verificado em `testes/contratos.test.mjs` e jogando no navegador.

| Cliente | Reputação mínima | Produtos | Quantidade | Prazo | Margem |
| --- | --- | --- | --- | --- | --- |
| Mercadinho Aurora | 0 | P ou M, parda, simples | 4 a 8 | 1:30 | 1,3 |
| Loja Bom Presente | 0 | P ou M, azul ou vermelha, simples | 3 a 6 | 1:40 | 1,5 |
| Confeitaria Doce Grão | 15 | P, vermelha, simples ou reforçada | 6 a 10 | 1:30 | 1,6 |
| Transportadora Rota Sul | 30 | G, parda, reforçada | 6 a 12 | 2:30 | 1,5 |
| Loja Virtual Clique | 50 | M ou G, qualquer cor, reforçada | 10 a 16 | 2:40 | 1,7 |
| Rede Varejo Centro | 70 | M ou G, parda ou azul, simples ou reforçada | 18 a 30 | 4:00 | 1,9 |

Com contratos, o catálogo passa a importar: a máquina automática precisa ser reprogramada (U) para o produto que o cliente pediu.

### v0.5.1 em detalhe (visual)

Feita antes da v0.6 para fixar o estilo enquanto o cenário ainda é pequeno. A régua foi o primeiro jogo: galpão com detalhes, objetos com forma reconhecível, rótulos no mundo e HUD de jogo. O 2 mantém identidade própria: luz do dia ao ar livre, azul-petróleo, laranja industrial e cinza-concreto.

- **Modelagem:** tudo é montado com blocos e cilindros do Three.js, sem arquivos de modelo. Texturas (concreto, zebrado, lona da esteira, placas) são desenhadas em canvas na hora.
- **Organização:** o visual fica em `js/visual/`. As regras não mudaram; os módulos de regra continuam sem importar o Three.js.
- **Esteiras:** a rota saiu de `producao.js` para `js/rotas.js`, com teste que verifica as 492 posições possíveis de máquina.
- **Câmera:** segue o jogador, gira em volta dele (Q, Z ou arrastando) e dá zoom (+, − ou roda). WASD passou a ser relativo à câmera. Essa parte estava prevista para a v0.8 e foi antecipada.
- **Dia e noite:** 6 minutos de jogo por dia, começando às 7h. A hora entra no save (campo `relogio`, opcional, sem mudar a versão do save).
- **HUD:** barra superior com dinheiro, progresso da meta, estoque, produção, máquinas, equipe e relógio; painel de produção à esquerda; avisos no centro; contratos à direita; controles recolhíveis (H).

### v0.6 em detalhe

| Regra | Valor |
| --- | --- |
| Desgaste por caixa | 2% |
| Chance de defeito | 3% + 0,25% por ponto de desgaste (máximo 28%) |
| Chance de quebra por caixa | 0 abaixo de 70%; (desgaste − 70)% de 70 a 99%; certa em 100% |
| Manutenção preventiva | 30% do desgaste em R$, entre R$ 5 e R$ 30 |
| Conserto | R$ 60 |
| Inspeção manual | R$ 1 a cada 5 caixas do estoque |
| Inspetor automático | R$ 80 por esteira |
| Devolução | cliente não paga a caixa; −2 de reputação por caixa, até −10 |
| Venda avulsa de defeituosa | 50% do preço |
| Consumo (tarifa normal) | R$ 1,00/h por máquina produzindo, R$ 0,35/h por esteira andando, R$ 0,08/h por máquina parada |
| Tarifa | noturna 22h–6h ×0,6; pico 18h–21h ×1,5; normal ×1 |
| Conta | cobrada à meia-noite; o que faltar vira dívida e corta a energia até ser paga |

- Uma hora de jogo dura 15 segundos (6 minutos por dia). Uma máquina automática produzindo o dia todo gasta cerca de R$ 24 de energia.
- Sem inspeção, as caixas defeituosas vão misturadas ao estoque e saem na mesma proporção quando um contrato é entregue.
- **Critério de pronto atendido:** defeitos separados na inspeção, máquina quebra e exige manutenção, consumo visível no HUD. Verificado em `testes/qualidade.test.mjs` e jogando no navegador.

### v0.6.1 em detalhe (trilha sonora)

O primeiro jogo usa um loop de 35 segundos (108 BPM, mono, 22 kHz) que repete igual o tempo todo, e bipes de onda quadrada nos eventos. A trilha do 2 foi feita para superar isso:

| | Império 1 | Império 2 |
| --- | --- | --- |
| Duração antes de repetir | 35 s | 1 min 55 s (48 compassos) |
| Formato | WAV mono 22 kHz (1,5 MB) | síntese em tempo real, estéreo, sem arquivo |
| Arranjo | fixo | 4 níveis de intensidade e versão noturna |
| Efeitos | bipes de onda quadrada | 10 efeitos com timbres próprios |

- **Partitura** (`js/audio/composicao.js`): ré menor, 100 BPM, swing de 12%. Seção A: B♭maj7, C6, Am7, Dm9. Seção B: Gm9, C7, Fmaj7, A7. Seção C (ponte): Dm7, B♭maj7, Gm7, A7sus resolvendo em A7.
- **Intensidade:** 0 sem máquinas (piano e pad), 1 com máquinas (baixo e chimbal), 2 com uma automática produzindo (bateria), 3 com duas ou mais (melodia). As camadas entram e saem com transição de 2 segundos.
- **Noite:** filtro passa-baixa em 2,2 kHz, bateria em meio tempo, piano sustentado, baixo só nos tempos fortes e melodia em sino.
- **Testes:** `testes/composicao.test.mjs` confere forma, duração, notas dentro do compasso e da tessitura. A gravação de uma prévia no navegador confirmou a entrada das camadas e o arranjo noturno.

### Salvamento em detalhe

- **Onde:** `localStorage` do navegador, na chave `imperio-industrial-2:save`. Cada navegador tem o seu save.
- **Quando:** a cada 5 segundos, ao fechar a página e ao trocar de aba.
- **O que:** relógio do dia, economia (dinheiro e vendido), quadro de contratos (reputação, ofertas, contratos com o tempo restante, cumpridos e vencidos), estoque por produto, escolha do catálogo, total de caixas produzidas, máquinas (posição, saída, esteira, automação e produto programado), posição dos funcionários e do jogador.
- **Produtos:** gravados só pela chave (por exemplo `M-1-0`) e reconstruídos pelo catálogo ao carregar. Se um preço mudar no catálogo, o save antigo usa o preço novo.
- **Versão:** o save tem o campo versao (hoje 4). Uma mudança de formato aumenta a versão e ganha uma função em MIGRACOES, que converte o save antigo.
- **Migração 1 → 2 (v0.5):** o pedido genérico é descartado; os pedidos cumpridos viram contratos cumpridos e dão 5 de reputação cada, a partir de 20.
- **Migração 2 → 3 (v0.6):** máquinas começam sem desgaste, estoque sem defeitos, refugo zerado e conta de luz nova. Caixas com defeito na saída de uma máquina são gravadas com `*` no fim da chave, e o estoque grava `[chave, quantidade, defeituosas]`.
- **Validação:** posições fora do terreno são trazidas para dentro, máquinas repetidas na mesma célula são descartadas, a saída respeita o limite de 8 caixas e os funcionários, o limite de 3. Se o armazenamento estiver bloqueado, o jogo roda sem salvar.
- **Esteiras:** caixas que estavam andando na esteira voltam para a saída da máquina ao carregar, para nenhuma se perder.
- **Cópia de segurança (v0.6.3):** chave `imperio-industrial-2:save:backup`, atualizada a cada 12 salvamentos (1 minuto). `carregar` usa a cópia se o save principal faltar ou estiver estragado; novo jogo apaga as duas.
- **Código do progresso (v0.6.3):** o save em JSON, codificado em UTF-8 e base64, com o prefixo `II2-`. É validado por `lerSave` antes de ser aceito.
- **Armazenamento bloqueado:** todo acesso ao `localStorage` fica dentro de `try`, porque alguns navegadores lançam erro só de acessá-lo. O jogo continua jogável e avisa que não está salvando.
- **Testes:** `testes/salvamento.test.mjs`.

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
| Meta da campanha | R$ 1.000 em vendas (contratos contam) |
| Multa de contrato vencido | 25% do pagamento |

| Caixa | Papelão simples | Reforçado |
| --- | --- | --- |
| Pequena | R$ 6 | R$ 12 |
| Média | R$ 10 | R$ 20 |
| Grande | R$ 16 | R$ 32 |

A cor muda só a aparência. Uma máquina automática produz 20 caixas por minuto de jogo; com caixas grandes reforçadas isso vale R$ 640 por minuto, ou R$ 600 descontado o papelão.

## Próximo passo

v0.8 — Decoração e construção avançada: compra de terreno, expansão da área útil e personalização do escritório e do galpão.

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

