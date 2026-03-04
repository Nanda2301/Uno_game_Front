import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uno_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('uno_token');
      localStorage.removeItem('uno_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/users', data),
  login: (email, password) => api.post('/users/login', { email, password }),
  logout: () => api.post('/users/logout'),
  me: () => api.get('/users/me'),
};

// ─── Games ────────────────────────────────────────────────────────────────
export const gameAPI = {
  list: () => api.get('/games'),
  get: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  join: (id) => api.post(`/games/${id}/join`),
  ready: (id) => api.post(`/games/${id}/ready`),
  start: (id) => api.post(`/games/${id}/start`),
  finish: (id) => api.post(`/games/${id}/finish`),
  history: (id) => api.get(`/games/${id}/history`),
  ranking: (id) => api.get(`/games/${id}/ranking`),
  delete: (id) => api.delete(`/games/${id}`),
};

// ─── Cards ────────────────────────────────────────────────────────────────
export const cardAPI = {
  myCards: () => api.get('/cards/my-cards'),
  update: (id, data) => api.put(`/cards/${id}`, data),
};

// ─── Scores ───────────────────────────────────────────────────────────────
export const scoreAPI = {
  ranking: () => api.get('/scores/ranking/geral'),
  top10: () => api.get('/scores/ranking/top10'),
  playerStats: (playerId) => api.get(`/scores/player/${playerId}/stats`),
};

export default api;