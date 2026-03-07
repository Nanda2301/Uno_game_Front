import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de REQUEST (só LÊ o token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uno_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de RESPONSE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("uno_token");
      localStorage.removeItem("uno_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post("/users", data),
  login: (email, password) =>
    api.post("/users/login", { email, password }),
  me: () => api.get("/users/me"),
  logout: () => api.post("/users/logout"),
};

// ─── GAMES ────────────────────────────────────────

export const gameAPI = {
  list: () => api.get("/games"),
  get: (id) => api.get(`/games/${id}`),
  create: (data) => api.post("/games", data),
  join: (id) => api.post(`/games/${id}/join`),
  drawCard: (id) => api.post(`/games/${id}/draw`),
  playCard: (gameId, cardId) =>
    api.post(`/games/${gameId}/play`, { cardId }),
  ranking: (id) => api.get(`/games/${id}/ranking`),
};

export default api;