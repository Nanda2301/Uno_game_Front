import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameAPI } from "../services/api";

// Backend: POST /api/games → body: { title, maxPlayers }  (src/models/Game.js)
// Validações do GameService.create:
//   - creatorId vem do JWT (authMiddleware)
//   - status padrão: "waiting"
//   - maxPlayers: entre 2 e 4

export default function CreateGamePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Digite um nome para a sala.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await gameAPI.create({ title: title.trim(), maxPlayers });
      // Backend retorna o game criado com status 201 (Result.ok(game, 201))
      const game = res.data?.data ?? res.data;
      navigate(`/game?id=${game.id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erro ao criar a sala."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(220,38,38,0.07) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/lobby")} className="text-gray-600 hover:text-white transition-colors text-sm">
            ← Voltar
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-sm font-black">U</div>
            <div>
              <h1 className="font-black text-xl">Nova Sala</h1>
              <p className="text-gray-500 text-xs">Configure a sua partida de UNO</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            {/* Nome da sala */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Nome da Sala
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Sala do João"
                maxLength={50}
                className="w-full bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
              />
            </div>

            {/* Número de jogadores */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Máximo de Jogadores
              </label>
              <div className="flex gap-2">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMaxPlayers(n)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      maxPlayers === n
                        ? "bg-red-600/20 border-red-500/40 text-red-300"
                        : "bg-white/[0.03] border-white/10 text-gray-500 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {n} jogadores
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                Você é adicionado automaticamente como posição 1 e já fica pronto.
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Criando...
                </>
              ) : "Criar Sala"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}