# Do Zero ao Império Industrial 2 — Distrito Industrial

Sequência da série *Do Zero ao Império Industrial*. O jogador começa em uma oficina alugada em um bairro industrial e constrói um grupo industrial com fábricas em várias regiões.

Este repositório é separado do [primeiro jogo](https://github.com/Hebersonmiliano/imperio-industrial-3d) e não reaproveita o código dele.

## Estado atual

Base inicial: cena 3D com chão de concreto, luz natural e a oficina como placeholder. Ainda não há jogabilidade.

## Como rodar

O navegador bloqueia módulos ES abertos direto do disco (`file://`), então é preciso um servidor local. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Estrutura

| Caminho | Função |
|---|---|
| `index.html` | Página e mapa de importação do Three.js |
| `style.css` | Estilo da página e cores de base |
| `js/main.js` | Cena, luz, chão e laço de renderização |
| `js/vendor/` | Three.js 0.186.1 (`three.module.js` e `three.core.js`, licença MIT) |
| `docs/design.md` | Documento de projeto: visão, sistemas, fases, arquitetura e roteiro |

## Documentação

O documento de projeto completo está em [docs/design.md](docs/design.md). Ele tem as decisões em aberto que precisam ser fechadas antes da v0.1.
