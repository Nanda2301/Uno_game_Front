import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("uno_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // LOGIN
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);

      const { token, user } = response.data;

      localStorage.setItem("uno_token", token);
      localStorage.setItem("uno_user", JSON.stringify(user));

      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(formData);

      // Se backend já retorna token:
      if (response.data.token) {
        localStorage.setItem("uno_token", response.data.token);
        localStorage.setItem(
          "uno_user",
          JSON.stringify(response.data.user)
        );
        setUser(response.data.user);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("uno_token");
    localStorage.removeItem("uno_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}