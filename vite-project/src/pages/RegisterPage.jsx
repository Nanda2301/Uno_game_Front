import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { authAPI } from "../services/api";

function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",     
    userName: "", 
    email: "",
    password: "",  
  });

  const [confirmarSenha, setConfirmarSenha] = useState("");

  function atualizarEstado(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== confirmarSenha) {
      alert("Senhas não conferem!");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.register(form);
      alert("Usuário criado com sucesso!");
      navigate("/"); // Redireciona para o login (rota raiz no seu App.jsx)
    } catch (error) {
      // Exibe a mensagem de erro vinda do backend se disponível
      alert(error.response?.data?.message || "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen w-full bg-[#b72428] flex items-center justify-center bg-no-repeat bg-left"
      style={{
        backgroundImage: "url('https://i.imgur.com/HWTtTYF.png')",
        backgroundSize: "contain"
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl h-screen">
        <div className="hidden lg:block" />

        <div className="flex items-center justify-center px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-[#fada2d] w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-4"
          >
            <h2 className="text-3xl font-black text-center text-black tracking-tighter mb-2">
              CREATE ACCOUNT
            </h2>

            <div className="flex flex-col gap-3">
              <input 
                name="name" 
                placeholder="Nome Completo" 
                value={form.name}
                onChange={atualizarEstado}
                required
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <input 
                name="userName" 
                placeholder="Nome de Jogador (Username)" 
                value={form.userName}
                onChange={atualizarEstado}
                required
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <input 
                type="email"
                name="email" 
                placeholder="Email" 
                value={form.email}
                onChange={atualizarEstado}
                required
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <input 
                type="password" 
                name="password"
                placeholder="Senha" 
                value={form.password}
                onChange={atualizarEstado}
                required
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <input 
                type="password" 
                placeholder="Confirmar Senha" 
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform flex justify-center items-center mt-2 disabled:opacity-50"
            >
              {isLoading ? <ClipLoader color="#ffffff" size={22} /> : "SIGN UP"}
            </button>

            <p className="text-center text-sm font-medium text-black">
              Already have an account?{" "}
              <Link to="/" className="font-bold underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;