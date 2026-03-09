import axios from "axios";

// ─── Instância base ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Injeta token em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uno_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login se token expirar (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("uno_token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

// ─── User API ─────────────────────────────────────────────────────────────────
// Rotas: src/routes/UserRoutes.js

export const userAPI = {
  // POST /users  → cria usuário (sem auth)
  register: (data) => api.post("/users", data),

  // POST /users/login → retorna { token }
  login: (email, password) => api.post("/users/login", { email, password }),

  // POST /users/logout → invalida token (requer auth)
  logout: () => api.post("/users/logout"),

  // GET /users/me → retorna { id, name, userName, email, ... }
  me: () => api.get("/users/me"),

  // GET /users/:id
  getById: (id) => api.get(`/users/${id}`),

  // PUT /users → atualiza usuário autenticado
  update: (data) => api.put("/users", data),

  // DELETE /users/:id
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Game API ─────────────────────────────────────────────────────────────────
// Rotas: src/routes/GameRoutes.js
// Modelos relevantes:
//   Game:       { id, title, status, maxPlayers, creatorId, currentPlayerPosition, direction, topDiscardCardId }
//   GamePlayer: { id, gameId, playerId, ready, position, score }

export const gameAPI = {

  listGames: () => api.get("/games"),
  createGame: (data) => api.post("/games", data),

  list: () => api.get("/games"),
  create: (data) => api.post("/games", data),

  get: (id) => api.get(`/games/${id}`),

  update: (id, data) => api.put(`/games/${id}`, data),

  delete: (id) => api.delete(`/games/${id}`),

  join: (id) => api.post(`/games/${id}/join`),

  ready: (id) => api.post(`/games/${id}/ready`),

  start: (id) => api.post(`/games/${id}/start`),

  finish: (id) => api.post(`/games/${id}/finish`),

  playCard: (id, cardId) => api.post(`/games/${id}/play`, { cardId }),

  drawCard: (id) => api.post(`/games/${id}/comprar`),

  leave: (id) => api.post(`/games/${id}/leave`),

  getHand: (id) => api.get(`/games/${id}/myhand`),

  getHistory: (id) => api.get(`/games/${id}/history`),

  getRanking: (id) => api.get(`/games/${id}/ranking`),

  getState: (id) => api.get(`/games/${id}/state`),

  sayUno: (gameId) => api.post(`/games/${gameId}/uno`),
};

// ─── Score API ────────────────────────────────────────────────────────────────
// Rotas: src/routes/ScoreRoutes.js

export const scoreAPI = {
  // GET /scores/ranking/geral
  rankingGeral: () => api.get("/scores/ranking/geral"),

  // GET /scores/ranking/top10
  top10: () => api.get("/scores/ranking/top10"),

  // GET /scores/player/:playerId/stats → estatísticas de um jogador
  playerStats: (playerId) => api.get(`/scores/player/${playerId}/stats`),
};

// ─── Stats API ────────────────────────────────────────────────────────────────
// Rotas: src/routes/StatisticRoutes.js

export const statsAPI = {
  requests: () => api.get("/stats/requests"),
  statusCodes: () => api.get("/stats/status-codes"),
  popularEndpoints: () => api.get("/stats/popular-endpoints"),
  responseTimes: () => api.get("/stats/response-times"),
};

export default api;