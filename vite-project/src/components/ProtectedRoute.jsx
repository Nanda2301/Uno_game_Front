import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  // 1. Se o contexto ainda estiver processando o login (isLoading), 
  // não redirecione ainda, espere terminar.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#b72428] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // 2. Verificação de segurança dupla:
  // Se não houver usuário no estado E não houver token no localStorage,
  // significa que ele realmente não está logado.
  const token = localStorage.getItem("uno_token");

  if (!user && !token) {
    return <Navigate to="/" replace />;
  }

  return children;
}