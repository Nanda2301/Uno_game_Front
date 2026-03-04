import { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";

// 1️⃣ Primeiro cria o contexto
export const AuthContext = createContext({});

// 2️⃣ Depois cria o hook customizado
export function useAuth() {
  return useContext(AuthContext);
}

// 3️⃣ Depois cria o provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("uno_token");
    const storedUser = localStorage.getItem("uno_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function login(email, password) {
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const data = response.data;

      localStorage.setItem("uno_token", data.token);
      localStorage.setItem("uno_user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error("Erro ao logar", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Erro no logout", error);
    }

    localStorage.removeItem("uno_token");
    localStorage.removeItem("uno_user");

    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}