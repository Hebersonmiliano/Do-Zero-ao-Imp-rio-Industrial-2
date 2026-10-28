# Do Zero ao Império Industrial 2 — Distrito Industrial

Sequência da série *Do Zero ao Império Industrial*. O jogador começa em uma oficina alugada em um bairro industrial e constrói um grupo industrial com fábricas em várias regiões.

Este repositório é separado do [primeiro jogo](https://github.com/Hebersonmiliano/imperio-industrial-3d) e não reaproveita o código dele.

**Jogue no Portal Pixel:** https://hebersonmiliano.github.io/portal-jogos/jogo.html?id=imperio-industrial-2

**Guia completo de como jogar:** [docs/GUIA.md](docs/GUIA.md)

## Estado atual

**v0.8 — Expansão e construção avançada.** Compre o terreno vizinho para liberar novas células de produção, construa um escritório administrativo e finalize a propriedade com uma fachada corporativa iluminada. As três etapas aparecem no cenário e ficam no save.

**v0.7 — Veículos e mapa de entregas.** Os contratos prontos agora são carregados na van; distância e trânsito consomem o prazo, o pagamento acontece na chegada e o veículo precisa voltar à doca. O painel mostra a rota em tempo real.

Antes dela veio a **v0.6.3 — Salvamento mais seguro.** Indicador "Salvo há X s" na barra, aviso quando o navegador bloqueia o armazenamento, cópia de segurança do save, pedido de armazenamento persistente e código do progresso para levar a partida a outro navegador.

**v0.6.2 — Controle, teclado e mouse.** Suporte a controle de Xbox, PlayStation e similares, barra de ações e menu clicáveis com o mouse, e dicas na tela que mostram a tecla ou o botão do controle conforme o que você está usando.

**v0.6.1 — Trilha sonora.** Música original composta para o jogo, gerada no navegador, que cresce com a fábrica e muda à noite, mais efeitos sonoros novos.

**v0.6 — Qualidade, manutenção e energia.** As máquinas se desgastam, fazem caixas com defeito e podem quebrar; a inspeção separa os defeitos; a linha consome energia, com conta diária e corte se a conta não for paga.

Antes dela veio a **v0.5.1 — Visual do Distrito.** A oficina virou um prédio de verdade, o terreno ganhou piso, faixas, cerca, doca e van, as máquinas e esteiras têm modelos e animação, o dia vira noite com luzes acendendo, a câmera gira e dá zoom, e o HUD foi redesenhado.

A **v0.5 — Clientes, contratos e reputação** trouxe os contratos: clientes do bairro oferecem contratos com uma caixa exata, quantidade, pagamento e prazo. Entregar no prazo aumenta a reputação, que libera clientes maiores e contratos mais bem pagos; atrasar custa multa e reputação.

O que já dá para jogar:

- Andar pela oficina no bairro, com prédios vizinhos, rua e árvores.
- Posicionar máquinas na grade e produzir caixas à mão.
- Escolher tamanho, cor e material de cada caixa.
- Guardar a produção no estoque, separada por produto.
- Aceitar contratos de seis tipos de clientes, despachar a van por rotas com trânsito e vender o estoque livre.
- Ganhar reputação para liberar clientes maiores.
- Contratar até 3 funcionários que produzem e levam caixas ao estoque sozinhos.
- Ligar esteiras e automatizar máquinas.
- Cuidar da manutenção, inspecionar a qualidade e pagar a conta de luz.
- Vencer a campanha com R$ 1.000 em vendas.
- Continuar de onde parou: o jogo salva sozinho no navegador.

## Controles

O jogo funciona com **teclado e mouse** ou **controle** (Xbox, PlayStation e similares com mapeamento padrão). O controle é reconhecido no primeiro botão apertado, e as dicas da tela passam a mostrar os botões dele. Com o mouse, a barra de ações no rodapé, os botões de tamanho, cor e material, as ofertas de contrato e o menu de comandos são clicáveis.

### Controle

| Botão | Ação |
|---|---|
| Analógico esquerdo | Andar (inclinar pouco anda devagar) |
| Analógico direito | Girar a câmera (esquerda e direita) e zoom (cima e baixo) |
| A | Produzir caixa · na tela inicial, começar |
| B | Levar a saída ao estoque |
| X | Despachar a van ou vender na expedição |
| Y | Colocar máquina |
| LB | Manutenção ou conserto |
| RB | Inspecionar estoque ou instalar inspetor |
| LT | Automatizar ou reprogramar |
| RT | Ligar esteira |
| Direcional ↑ ← → | Tamanho, cor e material |
| Direcional ↓ | Aceitar a primeira oferta de contrato |
| Menu | Menu de comandos: funcionário, ofertas 2 e 3, som, controles e novo jogo |
| View | Mostrar ou esconder os controles |

O controle vibra nas vendas e quando uma máquina quebra (se o controle e o navegador suportarem).

### Teclado e mouse

| Tecla | Ação |
|---|---|
| WASD ou setas | Andar (relativo à câmera: W vai para o fundo da tela) |
| B | Posicionar máquina na célula marcada no chão à frente do jogador (R$ 60) |
| E | Produzir uma caixa na máquina próxima (R$ 2 de papelão) |
| R | Levar a saída da máquina próxima ao estoque |
| V | Na expedição: carregar na van o contrato pronto; sem contrato pronto, vender o estoque livre |
| 1, 2, 3 | Aceitar a oferta de contrato nessa posição |
| K | Perto da máquina: manutenção preventiva (até R$ 30) ou conserto, se estiver quebrada (R$ 60) |
| I | Perto do estoque: inspecionar tudo (R$ 1 a cada 5 caixas). Perto de máquina com esteira: instalar inspetor automático (R$ 80) |
| T, C, M | Trocar tamanho, cor e material da próxima caixa |
| F | Contratar funcionário (R$ 80, até 3) |
| G | Comprar o terreno vizinho ou construir a próxima melhoria da propriedade |
| L | Ligar esteira da máquina próxima até o estoque (R$ 40) |
| U | Automatizar a máquina próxima (R$ 100); numa máquina já automática, reprograma o produto |
| Q, Z ou arrastar o mouse | Girar a câmera |
| + e −, ou roda do mouse | Aproximar e afastar |
| H | Mostrar ou esconder a lista de controles |
| O | Ligar ou desligar o som (também há um botão na barra superior) |
| Esc | Abrir ou fechar o menu de comandos |
| N duas vezes | Apagar o progresso e começar um jogo novo |

O quadrado no chão à frente do jogador mostra onde a próxima máquina vai ficar: verde se a célula está livre, vermelho se está ocupada.

### Luz das máquinas

| Cor | Situação |
|---|---|
| Apagada | Máquina manual |
| Verde | Automática, produzindo |
| Amarela | Automática, sem dinheiro para papelão |
| Vermelha | Saída cheia (8 caixas): a máquina parou. Ligue uma esteira ou recolha com R |
| Laranja piscando, com fumaça | Quebrada: aperte K perto dela para consertar |
| Azul | Sem energia: a conta de luz está atrasada |

## Contratos

O painel à direita mostra a reputação, até 3 ofertas e os contratos em andamento.

- Cada oferta pede uma caixa exata (tamanho, cor e material), uma quantidade e um prazo, e paga mais que a venda avulsa. Ela some depois de 1 minuto se ninguém aceitar, sem penalidade.
- Dá para ter até 3 contratos ao mesmo tempo. O painel mostra quantas caixas do produto já estão no estoque e fica verde quando o contrato está pronto para entrega.
- Entregar no prazo dá +5 de reputação. Deixar o prazo vencer cobra multa de 25% do pagamento e tira 10 de reputação.
- A venda avulsa (V) não vende caixas de um produto que algum contrato em andamento pediu.

| Cliente | Reputação mínima | Pede |
|---|---|---|
| Mercadinho Aurora | 0 | Pequenas e médias pardas, papelão simples |
| Loja Bom Presente | 0 | Pequenas e médias azuis ou vermelhas, papelão simples |
| Confeitaria Doce Grão | 15 | Pequenas vermelhas |
| Transportadora Rota Sul | 30 | Grandes pardas reforçadas |
| Loja Virtual Clique | 50 | Médias e grandes reforçadas, qualquer cor |
| Rede Varejo Centro | 70 | Médias e grandes em grande quantidade |

## Qualidade, manutenção e energia

- **Desgaste:** cada caixa desgasta a máquina em 2%. O rótulo sobre a máquina mostra o desgaste a partir de 50%.
- **Defeitos:** a chance vai de 3% com a máquina nova a 28% com ela gasta. A caixa defeituosa sai mais escura e torta.
- **Quebra:** acima de 70% de desgaste a máquina pode quebrar; em 100% ela quebra com certeza. Quebrada, não produz até o conserto.
- **Manutenção (K):** zera o desgaste. A preventiva custa 30% do desgaste (de R$ 5 a R$ 30); o conserto, R$ 60.
- **Inspeção (I):** no estoque, separa as defeituosas para a caçamba de refugo. Na esteira, o inspetor automático faz isso sozinho.
- **Devoluções:** caixa com defeito entregue em contrato volta. O cliente não paga por ela e a reputação cai 2 pontos por caixa (até 10). Na venda avulsa ela vale metade.
- **Energia:** máquina automática produzindo, esteira andando e máquina parada consomem energia. A tarifa é noturna das 22h às 6h (×0,6), de pico das 18h às 21h (×1,5) e normal no resto do dia. A conta do dia é cobrada à meia-noite; se faltar dinheiro, a dívida corta a energia da linha automática até ser paga.

## Trilha sonora

"Turno no Distrito" é uma composição original em ré menor, a 100 BPM, com balanço de *swing*. Tem 48 compassos em seis partes (A A B A C B), cerca de 1 minuto e 55 segundos antes de repetir. Tudo é sintetizado na hora pela Web Audio API, sem arquivos de som: piano elétrico, pad, baixo, bateria e melodia, com reverb e eco em estéreo.

- **Cresce com a fábrica:** sem máquinas tocam só piano e pad; com máquinas entram baixo e chimbal; com uma automática produzindo entra a bateria; com duas ou mais, a melodia completa.
- **Dia e noite:** à noite a bateria vai para meio tempo, o piano segura os acordes, o som fica mais abafado e a melodia passa para um timbre de sino.
- **Efeitos:** prensa ao produzir (as máquinas próximas soam mais alto), caixa registradora nas vendas, arpejo ao aceitar contrato, aviso de novo cliente, batida ao instalar máquina, moeda nas compras, estalo metálico na quebra, catraca no conserto e bipe de erro.
- O som começa no primeiro clique ou tecla, como os navegadores exigem, pausa quando a aba fica escondida e lembra se foi desligado.

## Visual

- **Terreno:** piso de concreto em placas, faixas de circulação amarelas, área de carga zebrada, cerca com portão e postes de luz.
- **Oficina:** prédio com portão de enrolar, porta, janelas, letreiro, ar-condicionado e luz quente no interior.
- **Máquinas:** gabinete com painel aceso, mesa, prensa que desce a cada caixa e torre de luz. As automáticas ganham um braço robótico laranja e uma faixa verde.
- **Esteiras:** lona animada, laterais amarelas e pés. A rota faz um L e contorna a oficina, a doca e a van.
- **Estoque e expedição:** a prateleira mostra as caixas guardadas com as cores dos produtos; a doca tem palete, carrinho e a van da empresa.
- **Pessoas:** jogador de colete laranja e funcionários de capacete amarelo andam com passo animado e carregam as caixas nas mãos.
- **Dia e noite:** um dia dura 6 minutos de jogo. À noite acendem janelas, letreiros, faróis da van e postes. O relógio fica no canto do HUD e é salvo.
- **Rótulos no mundo:** estoque, expedição (avisa quando há contrato pronto), saída de cada máquina e os ganhos subindo da doca a cada venda.

## Salvamento

O jogo salva sozinho a cada 5 segundos e ao fechar ou trocar de aba. O canto da barra superior mostra **"Salvo há X s"**. Ficam guardados o dinheiro, as vendas, a conta de luz, o refugo, a reputação, as ofertas e os contratos com o tempo que falta, o estoque, a caixa escolhida no catálogo, as máquinas (com saída, defeitos, desgaste, esteira, inspetor e automação), os funcionários, o relógio e a posição do jogador.

- **Onde fica:** no navegador de quem joga. Outro navegador, outro aparelho ou uma janela anônima começam do zero. Limpar os dados do site apaga o progresso.
- **Cópia de segurança:** a cada minuto o jogo guarda uma segunda cópia; se o save principal estragar, ela é usada.
- **Armazenamento persistente:** o jogo pede ao navegador para não apagar os dados sozinho quando faltar espaço.
- **Navegador bloqueando:** se o navegador não deixar salvar (janela anônima ou dados de sites bloqueados), a tela inicial avisa e a barra mostra "Não está salvando" em vermelho.
- **Código do progresso:** no menu (Esc ou Menu no controle), "Copiar código do progresso" gera um texto começando por `II2-` com a partida inteira. Em outro navegador, "Carregar progresso de um código" continua de onde parou. Guarde o código de vez em quando como backup.
- Partidas salvas antes da v0.5 abrem normalmente.

## Como rodar

O navegador bloqueia módulos ES abertos direto do disco (`file://`), então é preciso um servidor local. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Testes

As regras da linha automática, dos contratos, da qualidade e energia, das rotas de esteira e do salvamento não dependem do Three.js e rodam no Node 18 ou mais novo:

```bash
node testes/automacao.test.mjs
node testes/composicao.test.mjs
node testes/contratos.test.mjs
node testes/construcao.test.mjs
node testes/entrada.test.mjs
node testes/entregas.test.mjs
node testes/qualidade.test.mjs
node testes/rotas.test.mjs
node testes/salvamento.test.mjs
```

## Estrutura

| Caminho | Função |
|---|---|
| `index.html` | Página, HUD, painel de contratos e mapa de importação do Three.js |
| `style.css` | Estilo da página e cores de base |
| `js/main.js` | Cena, luz, oficina, expedição, teclas e laço de renderização |
| `js/cenario.js` | Bairro em volta da área de jogo: rua, calçadas, postes, prédios, árvores e carros |
| `js/visual/materiais.js` | Paleta, materiais, texturas desenhadas em canvas e luzes que acendem à noite |
| `js/visual/ambiente.js` | Céu, sol, neblina e ciclo de dia e noite |
| `js/visual/camera.js` | Câmera que segue o jogador, gira e dá zoom |
| `js/visual/terreno.js` | Piso, faixas, cerca, postes e cursor de posicionamento |
| `js/visual/oficina.js` | Prédio da oficina |
| `js/visual/estacoes.js` | Prateleira do estoque, doca de expedição, van, caçamba de refugo e modelo de caixa |
| `js/visual/pessoa.js` | Modelo e animação do jogador e dos funcionários |
| `js/visual/rotulos.js` | Rótulos que acompanham pontos do mundo e ganhos flutuantes |
| `js/grade.js` | Limites do terreno e obstáculos da grade |
| `js/jogador.js` | Movimento do jogador relativo à câmera e colisão |
| `js/producao.js` | Modelos e animação de máquinas, caixas na saída e esteiras |
| `js/rotas.js` | Rotas em L das esteiras, contornando oficina, doca e van |
| `js/automacao.js` | Regras da linha automática: produção sozinha, limite da saída e vazão da esteira |
| `js/contratos.js` | Clientes, ofertas, contratos, prazos, multas e reputação |
| `js/construcao.js` | Compra do terreno e progressão das melhorias da propriedade |
| `js/visual/expansao.js` | Lote vizinho, escritório administrativo e fachada corporativa |
| `js/audio/composicao.js` | Partitura da trilha: acordes, melodia, baixo, bateria e forma |
| `js/audio/musica.js` | Motor de áudio: instrumentos sintetizados, camadas, arranjo noturno e efeitos |
| `js/entrada.js` | Leitura do controle: zona morta, gatilhos, botões e mapeamento padrão |
| `js/qualidade.js` | Desgaste, defeitos, quebra, manutenção e inspeção |
| `js/energia.js` | Consumo, tarifas por hora, conta diária, dívida e corte |
| `js/salvamento.js` | Save versionado no navegador: montar, validar, migrar, gravar, cópia de segurança e código do progresso |
| `js/catalogo.js` | Tamanhos, cores e materiais das caixas |
| `js/estoque.js` | Estoque separado por produto, vendas e retirada de pedidos |
| `js/economia.js` | Dinheiro, custos, multas e meta da campanha |
| `js/funcionarios.js` | Funcionários que produzem e transportam sozinhos |
| `js/vendor/` | Three.js 0.186.1 (`three.module.js` e `three.core.js`, licença MIT) |
| `testes/` | Testes automatizados no Node |
| `docs/GUIA.md` | Guia completo de como jogar, com imagens |
| `docs/design.md` | Documento de projeto: visão, sistemas, fases, arquitetura, roteiro e estado |

## Documentação

O documento de projeto completo, com o estado de cada versão e os números da economia, está em [docs/design.md](docs/design.md).

