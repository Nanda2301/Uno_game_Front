import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const { login, user, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/lobby");
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      alert("Credenciais inválidas!");
    }
  }

  return (

    <div 
      className="min-h-screen w-full bg-[#b72428] flex items-center justify-center bg-no-repeat bg-left"
      style={{
        backgroundImage: "url('https://i.imgur.com/HWTtTYF.png')",
        backgroundSize: "contain" // Mantém a ilustração na proporção correta à esquerda
      }}
    >
      {/* Grid transparente para manter o formulário no lugar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl h-screen">
        
        <div className="hidden lg:block" />

        {/* Formulário centralizado na sua metade */}
        <div className="flex items-center justify-center px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-[#fada2d] w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl flex flex-col gap-6"
          >
            <h2 className="text-3xl font-black text-center text-black tracking-tighter">
              LOGIN TO YOUR ACCOUNT
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl border-none bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform flex justify-center items-center"
            >
              {isLoading ? <ClipLoader color="#ffffff" size={22} /> : "LOGIN"}
            </button>

            <p className="text-center text-sm font-medium text-black">
              Don’t have an account?{" "}
              <Link to="/register" className="font-bold underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;