import { createContext, useState, useEffect, useContext } from "react";
import { userAPI } from "../services/api";

export const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────
  // Carregar usuário ao iniciar aplicação
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("uno_token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        const response = await userAPI.me();

        // Corrige quando backend retorna array
        const loggedUser = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        setUser(loggedUser);

        localStorage.setItem("uno_user", JSON.stringify(loggedUser));

      } catch (error) {
        console.error("Erro ao carregar usuário:", error);

        localStorage.removeItem("uno_token");
        localStorage.removeItem("uno_user");

        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // ─────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────
  async function login(email, password) {
    setIsLoading(true);

    try {
      const response = await userAPI.login(email, password);

      const { token } = response.data;

      localStorage.setItem("uno_token", token);
      setToken(token);

      // Buscar dados do usuário após login
      const responseUser = await userAPI.me();

      const loggedUser = Array.isArray(responseUser.data)
        ? responseUser.data[0]
        : responseUser.data;

      setUser(loggedUser);

      localStorage.setItem("uno_user", JSON.stringify(loggedUser));

      return loggedUser;

    } catch (error) {
      console.error("Erro ao logar:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────
  async function logout() {
    try {
      await userAPI.logout();
    } catch (error) {
      console.error("Erro no logout:", error);
    }

    localStorage.removeItem("uno_token");
    localStorage.removeItem("uno_user");

    setToken(null);
    setUser(null);
  }

  // ─────────────────────────────────────────────
  // Context value
  // ─────────────────────────────────────────────
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}