import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, user, isLoading } = useAuth();
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

    if (isLoading) return;

    try {
      await login(email.trim(), password);
      navigate("/lobby");
    } catch (err) {
      console.error(err);
      alert("Falha no login. Verifique seu email e senha.");
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-[#b72428] flex items-center justify-center bg-no-repeat bg-left"
      style={{
        backgroundImage: "url('https://i.imgur.com/HWTtTYF.png')",
        backgroundSize: "contain",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl h-screen">
        <div className="hidden lg:block" />

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
                className="w-full p-3 rounded-xl border-none bg-white text-black focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl border-none bg-white text-black focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform flex justify-center items-center"
            >
              {isLoading ? (
                <ClipLoader color="#ffffff" size={22} />
              ) : (
                "LOGIN"
              )}
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