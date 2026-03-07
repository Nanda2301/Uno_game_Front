# 🎴 UNO Arena — Frontend

Interface moderna e responsiva para o backend UNO em Node.js.

## 🚀 Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento (com proxy para :3000)
npm run dev

# 3. Build para produção
npm run build
```

> **Importante:** O backend deve estar rodando em `http://localhost:3000`

---

## 📁 Estrutura de Componentes

```
src/
├── App.jsx                    # Rotas principais (React Router v6)
├── main.jsx                   # Entry point
├── index.css                  # Tailwind + estilos globais
│
├── context/
│   └── AuthContext.jsx        # Estado global de autenticação
│
├── services/
│   └── api.js                 # Axios + interceptors + endpoints
│
├── components/
│   ├── UnoCard.jsx            # Carta renderizada (cores, valores, animações)
│   └── ProtectedRoute.jsx     # Wrapper de rota autenticada
│
└── pages/
    ├── AuthPage.jsx           # Login + Cadastro
    ├── LobbyPage.jsx          # Lista salas, cria sala, ranking global
    └── GamePage.jsx           # Mesa de jogo completa
```

---

## 🎨 Design System

### Paleta de Cores
```js
uno.red    → #E8001C   // Cartas vermelhas / CTAs primários
uno.blue   → #0066CC   // Cartas azuis
uno.green  → #00A550   // Cartas verdes / sucesso
uno.yellow → #FFD700   // Cartas amarelas / destaque
arena.bg   → #0D0D1A   // Fundo principal
arena.glow → #4A6CF7   // Acentos e foco
```

### Fontes
- **Bangers** — Display (títulos, cartas, UNO logo)
- **DM Sans** — Body (texto, UI)

### Classes Utilitárias Customizadas
```css
.glass-panel        /* Container translúcido com blur */
.btn-primary        /* Botão vermelho UNO com glow */
.btn-secondary      /* Botão outline dark */
.btn-success        /* Botão verde */
.input-field        /* Input estilizado dark */
.status-waiting     /* Badge amarelo */
.status-progress    /* Badge verde */
.status-finished    /* Badge cinza */
.arena-bg-pattern   /* Grid de pontos azulados */
.neon-text-red      /* Text-shadow neon vermelho */
```

---

## 🔌 API Integration (`src/services/api.js`)

### Autenticação
```js
authAPI.register(data)        // POST /users
authAPI.login(email, pass)    // POST /users/login → retorna { token }
authAPI.logout()              // POST /users/logout
authAPI.me()                  // GET  /users/me
```

### Jogos
```js
gameAPI.list()                // GET  /games
gameAPI.get(id)               // GET  /games/:id
gameAPI.create(data)          // POST /games
gameAPI.join(id)              // POST /games/:id/join
gameAPI.ready(id)             // POST /games/:id/ready
gameAPI.start(id)             // POST /games/:id/start
gameAPI.finish(id)            // POST /games/:id/finish
gameAPI.history(id)           // GET  /games/:id/history
gameAPI.ranking(id)           // GET  /games/:id/ranking
```

### Cartas
```js
cardAPI.myCards()             // GET  /cards/my-cards  (auth required)
cardAPI.update(id, data)      // PUT  /cards/:id
```

### Pontuações
```js
scoreAPI.ranking()            // GET  /scores/ranking/geral
scoreAPI.top10()              // GET  /scores/ranking/top10
scoreAPI.playerStats(id)      // GET  /scores/player/:id/stats
```

---

## 🎮 Fluxo de Estados do Jogo

```
WAITING (Lobby)
  └─ Jogadores entram → ficam prontos
  └─ Criador inicia  →  IN_PROGRESS

IN_PROGRESS (Mesa)
  └─ Cartas na mão, carta no topo
  └─ Seleção → jogar / comprar
  └─ Wild cards → color picker
  └─ Criador finaliza → FINISHED

FINISHED (Resultado)
  └─ Ranking da partida
  └─ Voltar ao lobby
```

---

## ✨ Features

- **UnoCard** — Renderiza qualquer carta com cor, valor, efeitos de brilho e flip
- **Mesa de jogo** — Posicionamento dinâmico dos jogadores em volta da mesa
- **Animações** — Float, slide-up, deal (distribuição de cartas), glow pulsante
- **Polling automático** — Atualiza estado do jogo a cada 5s
- **Wild Color Picker** — Modal para escolher cor após jogar wild/+4
- **Histórico** — Drawer lateral com eventos da partida
- **Ranking** — Drawer lateral com placar final
- **Responsivo** — Mobile-first, funciona em qualquer tela
- **Toast notifications** — Feedback visual para todas as ações