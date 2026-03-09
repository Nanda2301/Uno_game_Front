import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gameAPI } from "../services/api";

function statusInfo(status) {
  switch (status) {
    case "in_progress":
      return {
        label: "Em Jogo",
        color: "text-blue-200",
        bg: "bg-blue-600/40 border-blue-400/50"
      };

    case "finished":
      return {
        label: "Finalizado",
        color: "text-white/50",
        bg: "bg-black/20 border-white/10"
      };

    default:
      return {
        label: "Aberto",
        color: "text-white/90",
        bg: "bg-green-700/60 border-green-800/50"
      };
  }
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
    </div>
  );
}

function GameCard({ game, onJoin }) {
  const playerCount = game?.players?.length ?? 0;
  const isFull = playerCount >= (game?.maxPlayers ?? 2);

  const { label, color, bg } = statusInfo(game?.status);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/10 p-6">

      <div className="flex justify-between items-center">

        <h3 className="font-black text-2xl italic text-white">
          Sala #{game?.id}
        </h3>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${color} ${bg}`}
        >
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-white/90">
        {playerCount}/{game?.maxPlayers ?? 2} jogadores
      </p>

      <button
        onClick={() => onJoin(game.id)}
        disabled={isFull || game?.status !== "waiting"}
        className="mt-2 rounded-2xl px-4 py-3 font-black uppercase bg-yellow-400 text-[#b72428] disabled:opacity-50"
      >
        {isFull ? "Sala cheia" : "Entrar"}
      </button>

    </div>
  );
}

export default function LobbyPage() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const displayName =
    user?.userName ?? user?.name ?? user?.email ?? "Jogador";

  const loadGames = useCallback(async () => {
    try {

      setLoading(true);

      const response = await gameAPI.list();

      const gamesData =
        response?.data?.games ??
        response?.data ??
        [];

      setGames(gamesData);

    } catch (err) {

      console.error("Erro ao carregar salas:", err);

    } finally {

      setLoading(false);

    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const handleCreateGame = async () => {

    try {

      setCreating(true);

      const response = await gameAPI.create({
        title: "Mesa UNO",
        maxPlayers: 2
      });

      const gameId =
        response?.data?.id ??
        response?.data?.game?.id;

      if (!gameId) {
        throw new Error("ID da sala não retornado");
      }

      navigate(`/game/${gameId}`);

    } catch (err) {

      console.error("Erro ao criar sala:", err);
      alert("Erro ao criar sala.");

    } finally {

      setCreating(false);

    }
  };

  const handleJoinGame = async (gameId) => {

    try {

      await gameAPI.join(gameId);

    } catch (error) {

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error;

      // Se já estiver na sala, apenas entra
      if (message === "Jogador já está nesta partida") {
        console.log("Jogador já estava na sala, entrando...");
      } else {

        console.error("Erro ao entrar na sala:", error);
        alert("Não foi possível entrar na sala.");
        return;

      }
    }

    navigate(`/game/${gameId}`);
  };

  return (
    <div className="min-h-screen">

      <header className="bg-black/20 border-b border-white/10">

        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">

          <h1 className="text-3xl font-black text-white italic">
            🎴 UNO CARDS
          </h1>

          <div className="flex items-center gap-4">

            <span className="text-white font-bold">
              {displayName}
            </span>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-white/70 hover:text-white text-xs uppercase"
            >
              Sair
            </button>

          </div>

        </div>

      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">

        <div className="flex justify-between items-center mb-10">

          <h2 className="text-4xl font-black text-white italic">
            Mesas disponíveis
          </h2>

          <button
            onClick={handleCreateGame}
            disabled={creating}
            className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black disabled:opacity-50"
          >
            {creating ? "Criando..." : "Criar nova sala"}
          </button>

        </div>

        {loading ? (
          <Spinner />
        ) : games.length === 0 ? (

          <p className="text-white/60 text-center">
            Nenhuma mesa encontrada.
          </p>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onJoin={handleJoinGame}
              />
            ))}

          </div>

        )}

      </main>
    </div>
  );
}