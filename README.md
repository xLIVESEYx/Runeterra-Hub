# 🌌 Runeterra Hub — League of Legends Champions

[![Deploy to GitHub Pages](https://github.com/earendil-works/runeterra-hub/actions/workflows/deploy.yml/badge.svg)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Riot Games Data Dragon API](https://img.shields.io/badge/Data%20Dragon-Riot%20Games-00d2ff.svg)](https://developer.riotgames.com/docs/lol)

Um portal web cinematográfico, ultra-rápido e responsivo para explorar o universo de campeões de **League of Legends**. O projeto foi desenhado sob a estética do cliente oficial (tema Hextech Dark) com foco em transições premium, zero cortes de imagem e **auto-atualização em tempo real** diretamente da infraestrutura da Riot Games.

---

## ⚡ Recursos Principais

- **Auto-Atualização Autônoma**: O site consome diretamente a **Data Dragon API** da Riot. Toda vez que um novo Patch é lançado (ex: `13.24.1` -> `14.1.1`), o site identifica a nova versão e atualiza os campeões, estatísticas, habilidades, lores e skins **automaticamente**, sem intervenção manual.
- **Cache Local Inteligente (Stale-While-Revalidate)**: Os dados de patches e campeões são salvos em `localStorage`. Na próxima visita, o site carrega instantaneamente em milissegundos usando o cache e valida a versão em background. Se houver um novo Patch, ele atualiza a tela de forma fluida.
- **Galeria de Skins Sem Cortes (Widescreen Lightbox)**: Clicar em qualquer skin abre a ilustração oficial horizontal de splash em alta resolução, ajustada ao viewport com `object-fit: contain` (sem cortes distorcidos) e navegação simplificada por teclado (`←`, `→`, `Esc`).
- **Cards Dinâmicos & Micro-Interações**: Efeito Hover Hextech com zoom de câmera lento na splash e fumaça cósmica em degradê.
- **Detecção de Conectividade**: O app detecta dinamicamente se o usuário está offline e desabilita carregamentos de rede de forma segura, garantindo integridade visual.
- **Filtro & Busca com Debounce**: Mecanismo de busca ultra-rápido por nome ou título com atraso adaptativo de input (debounce) para otimizar desempenho.

---

## 🏗️ Estrutura do Projeto

O site é estático e super leve, não dependendo de frameworks pesados, garantindo carregamento rápido em dispositivos móveis.

```bash
├── index.html          # Entrada principal (raiz — exigido pelo GitHub Pages)
├── .nojekyll           # Evita que o GitHub Pages tente processar pastas sob Jekyll
├── README.md           # Documentação e guia de implantação
├── LICENSE             # Licença pública MIT
├── .gitignore          # Arquivos e diretórios ocultados do controle de versão
├── .github/
│   └── workflows/
│       └── deploy.yml  # Workflow de deploy automático para GitHub Pages
└── src/
    ├── app.js          # Lógica de estados, cache, lightbox, e conexões API
    └── styles.css      # Design System Hextech, animações, media-queries
```

> A raiz contém apenas arquivos obrigatórios (`index.html`, `.nojekyll`, meta-arquivos de repositório e workflows). Todo o código-fonte fica isolado em `src/`, mantendo a estrutura limpa.

> ℹ️ O `index.html` referencia os assets como `src/styles.css` e `src/app.js` (caminhos relativos), o que funciona corretamente tanto em domínio próprio quanto em subpaths do GitHub Pages (`https://usuario.github.io/repositorio/`).

---

## 🚀 Como Publicar no GitHub Pages

Este projeto já está pronto para **GitHub Pages** (inclui `.nojekyll`, um workflow de deploy em `.github/workflows/deploy.yml` e todos os caminhos de assets relativos). Há duas formas de publicar:

### Opção A — Deploy automático via GitHub Actions (recomendado)

1. **Crie um repositório no GitHub** (ex: `runeterra-hub`).
2. **Envie os arquivos do projeto** para a branch principal (`main` ou `master`):
   ```bash
   git init
   git add .
   git commit -m "feat: design premium, cache e lightbox"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. No painel do seu repositório no GitHub:
   - Vá em **Settings** ⚙️ → **Pages** (em "Code and automation").
   - Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. A cada `push` na `main`, o workflow `.github/workflows/deploy.yml` PUBLICARÁ o site automaticamente. O link público será do tipo `https://seu-usuario.github.io/seu-repositorio/`.

### Opção B — Deploy direto por branch (sem Actions)

1. Envie os arquivos para `main`/`master` como acima.
2. Vá em **Settings** ⚙️ → **Pages**.
3. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
4. Escolha a branch `main` e a pasta `/ (root)` → clique em **Save**.
5. Em instantes o GitHub fornecerá o link público do site.

> 💡 Recomendamos a **Opção A** (GitHub Actions), pois o deploy se torna automático a cada commit, sem intervenção manual.

---

## 🛡️ Isenção de Responsabilidade

Este projeto é um portal de fãs e portfólio de engenharia de software sem fins lucrativos.
**Runeterra Hub** não é endossado pela Riot Games e não reflete as visões ou opiniões da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou administração das propriedades de League of Legends. League of Legends e Riot Games são marcas comerciais ou marcas registradas da Riot Games, Inc.
