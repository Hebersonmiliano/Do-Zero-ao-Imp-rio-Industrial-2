# Do Zero ao Império Industrial 2 — Distrito Industrial

Sequência da série *Do Zero ao Império Industrial*. O jogador começa em uma oficina alugada em um bairro industrial e constrói um grupo industrial com fábricas em várias regiões.

Este repositório é separado do [primeiro jogo](https://github.com/Hebersonmiliano/imperio-industrial-3d) e não reaproveita o código dele.

## Estado atual

**v0.4 — Máquinas, esteiras e automação.** A linha completa roda sem o jogador: a máquina automática fabrica as caixas, a esteira leva uma a uma até o estoque, e a luz de cada máquina mostra onde a produção travou.

O que já dá para jogar:

- Andar pela oficina no bairro, com prédios vizinhos, rua e árvores.
- Posicionar máquinas na grade e produzir caixas à mão.
- Escolher tamanho, cor e material de cada caixa.
- Guardar a produção no estoque, separada por produto.
- Vender na expedição ou cumprir pedidos de clientes, com bônus que crescem a cada pedido.
- Contratar até 3 funcionários que produzem e levam caixas ao estoque sozinhos.
- Ligar esteiras e automatizar máquinas.
- Vencer a campanha com R$ 1.000 em vendas.

Ainda não há salvamento: recarregar a página recomeça o jogo.

## Controles

| Tecla | Ação |
|---|---|
| WASD ou setas | Andar |
| B | Posicionar máquina à frente do jogador (R$ 60) |
| E | Produzir uma caixa na máquina próxima (R$ 2 de papelão) |
| R | Levar a saída da máquina próxima ao estoque |
| V | Na expedição: cumprir o pedido do cliente ou vender todo o estoque |
| T, C, M | Trocar tamanho, cor e material da próxima caixa |
| F | Contratar funcionário (R$ 80, até 3) |
| L | Ligar esteira da máquina próxima até o estoque (R$ 40) |
| U | Automatizar a máquina próxima (R$ 100); numa máquina já automática, reprograma o produto |

### Luz das máquinas

| Cor | Situação |
|---|---|
| Cinza | Máquina manual |
| Verde | Automática, produzindo |
| Amarela | Automática, sem dinheiro para papelão |
| Vermelha | Saída cheia (8 caixas): a máquina parou. Ligue uma esteira ou recolha com R |

## Como rodar

O navegador bloqueia módulos ES abertos direto do disco (`file://`), então é preciso um servidor local. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Testes

As regras da linha automática não dependem do Three.js e rodam no Node 18 ou mais novo:

```bash
node testes/automacao.test.mjs
```

## Estrutura

| Caminho | Função |
|---|---|
| `index.html` | Página, HUD e mapa de importação do Three.js |
| `style.css` | Estilo da página e cores de base |
| `js/main.js` | Cena, luz, oficina, expedição, teclas e laço de renderização |
| `js/cenario.js` | Bairro em volta da área de jogo: rua, calçadas, prédios e árvores |
| `js/grade.js` | Limites do terreno e obstáculos da grade |
| `js/jogador.js` | Personagem do jogador, movimento e colisão |
| `js/producao.js` | Máquinas, caixas na saída, esteiras e luz de situação |
| `js/automacao.js` | Regras da linha automática: produção sozinha, limite da saída e vazão da esteira |
| `js/catalogo.js` | Tamanhos, cores e materiais das caixas |
| `js/estoque.js` | Estoque separado por produto, vendas e retirada de pedidos |
| `js/economia.js` | Dinheiro, custos, pedidos de cliente e meta da campanha |
| `js/funcionarios.js` | Funcionários que produzem e transportam sozinhos |
| `js/vendor/` | Three.js 0.186.1 (`three.module.js` e `three.core.js`, licença MIT) |
| `testes/` | Testes automatizados no Node |
| `docs/design.md` | Documento de projeto: visão, sistemas, fases, arquitetura, roteiro e estado |

## Documentação

O documento de projeto completo, com o estado de cada versão e os números da economia, está em [docs/design.md](docs/design.md).
