# Do Zero ao Império Industrial 2 — Distrito Industrial

Sequência da série *Do Zero ao Império Industrial*. O jogador começa em uma oficina alugada em um bairro industrial e constrói um grupo industrial com fábricas em várias regiões.

Este repositório é separado do [primeiro jogo](https://github.com/Hebersonmiliano/imperio-industrial-3d) e não reaproveita o código dele.

## Estado atual

**v0.5 — Clientes, contratos e reputação.** Clientes do bairro oferecem contratos com uma caixa exata, quantidade, pagamento e prazo. Entregar no prazo aumenta a reputação, que libera clientes maiores e contratos mais bem pagos; atrasar custa multa e reputação.

O que já dá para jogar:

- Andar pela oficina no bairro, com prédios vizinhos, rua e árvores.
- Posicionar máquinas na grade e produzir caixas à mão.
- Escolher tamanho, cor e material de cada caixa.
- Guardar a produção no estoque, separada por produto.
- Aceitar contratos de seis tipos de clientes e entregá-los na expedição, ou vender o estoque livre.
- Ganhar reputação para liberar clientes maiores.
- Contratar até 3 funcionários que produzem e levam caixas ao estoque sozinhos.
- Ligar esteiras e automatizar máquinas.
- Vencer a campanha com R$ 1.000 em vendas.
- Continuar de onde parou: o jogo salva sozinho no navegador.

## Controles

| Tecla | Ação |
|---|---|
| WASD ou setas | Andar |
| B | Posicionar máquina à frente do jogador (R$ 60) |
| E | Produzir uma caixa na máquina próxima (R$ 2 de papelão) |
| R | Levar a saída da máquina próxima ao estoque |
| V | Na expedição: entregar os contratos que o estoque cobre; sem contrato pronto, vender o estoque que nenhum contrato pediu |
| 1, 2, 3 | Aceitar a oferta de contrato nessa posição |
| T, C, M | Trocar tamanho, cor e material da próxima caixa |
| F | Contratar funcionário (R$ 80, até 3) |
| L | Ligar esteira da máquina próxima até o estoque (R$ 40) |
| U | Automatizar a máquina próxima (R$ 100); numa máquina já automática, reprograma o produto |
| N duas vezes | Apagar o progresso e começar um jogo novo |

### Luz das máquinas

| Cor | Situação |
|---|---|
| Cinza | Máquina manual |
| Verde | Automática, produzindo |
| Amarela | Automática, sem dinheiro para papelão |
| Vermelha | Saída cheia (8 caixas): a máquina parou. Ligue uma esteira ou recolha com R |

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

## Salvamento

O jogo salva sozinho a cada 5 segundos e ao fechar ou trocar de aba. Ficam guardados o dinheiro, as vendas, a reputação, as ofertas e os contratos com o tempo que falta, o estoque, a caixa escolhida no catálogo, as máquinas (com saída, esteira e automação), os funcionários e a posição do jogador. O save fica no navegador de quem joga; outro navegador ou aparelho começa do zero. Partidas salvas antes da v0.5 abrem normalmente: os pedidos cumpridos viram reputação.

## Como rodar

O navegador bloqueia módulos ES abertos direto do disco (`file://`), então é preciso um servidor local. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Testes

As regras da linha automática, dos contratos e do salvamento não dependem do Three.js e rodam no Node 18 ou mais novo:

```bash
node testes/automacao.test.mjs
node testes/contratos.test.mjs
node testes/salvamento.test.mjs
```

## Estrutura

| Caminho | Função |
|---|---|
| `index.html` | Página, HUD, painel de contratos e mapa de importação do Three.js |
| `style.css` | Estilo da página e cores de base |
| `js/main.js` | Cena, luz, oficina, expedição, teclas e laço de renderização |
| `js/cenario.js` | Bairro em volta da área de jogo: rua, calçadas, prédios e árvores |
| `js/grade.js` | Limites do terreno e obstáculos da grade |
| `js/jogador.js` | Personagem do jogador, movimento e colisão |
| `js/producao.js` | Máquinas, caixas na saída, esteiras e luz de situação |
| `js/automacao.js` | Regras da linha automática: produção sozinha, limite da saída e vazão da esteira |
| `js/contratos.js` | Clientes, ofertas, contratos, prazos, multas e reputação |
| `js/salvamento.js` | Save versionado no navegador: montar, validar, migrar, gravar e apagar |
| `js/catalogo.js` | Tamanhos, cores e materiais das caixas |
| `js/estoque.js` | Estoque separado por produto, vendas e retirada de pedidos |
| `js/economia.js` | Dinheiro, custos, multas e meta da campanha |
| `js/funcionarios.js` | Funcionários que produzem e transportam sozinhos |
| `js/vendor/` | Three.js 0.186.1 (`three.module.js` e `three.core.js`, licença MIT) |
| `testes/` | Testes automatizados no Node |
| `docs/design.md` | Documento de projeto: visão, sistemas, fases, arquitetura, roteiro e estado |

## Documentação

O documento de projeto completo, com o estado de cada versão e os números da economia, está em [docs/design.md](docs/design.md).
