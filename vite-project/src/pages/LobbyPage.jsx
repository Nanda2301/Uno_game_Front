import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gameAPI } from "../services/api";
import { socket } from "../services/socket";

// Helper para estilização baseada no status
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
  const maxPlayers = game?.maxPlayers ?? 2;
  const isFull = playerCount >= maxPlayers;
  const { label, color, bg } = statusInfo(game?.status);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-2xl italic text-white">
          Sala #{game?.id}
        </h3>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${color} ${bg}`}>
          {label}
        </span>
      </div>

      <p className="text-sm font-bold text-white/90">
        {playerCount}/{maxPlayers} jogadores
      </p>

      <button
        onClick={() => onJoin(game.id)}
        disabled={isFull || game?.status !== "waiting"}
        className="mt-2 rounded-2xl px-4 py-3 font-black uppercase bg-yellow-400 text-[#b72428] hover:bg-yellow-300 disabled:opacity-50 disabled:bg-gray-500 disabled:text-white transition-colors"
      >
        {isFull && game?.status === "waiting" ? "Sala cheia" : game?.status !== "waiting" ? "Em andamento" : "Entrar"}
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

  const displayName = user?.userName ?? user?.name ?? user?.email ?? "Jogador";

  // FUNÇÃO PARA CARREGAR AS SALAS
  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gameAPI.list();
      
      // Garante que gamesData seja um array independente do formato da API
      const gamesData = response?.data?.games ?? response?.data ?? [];
      setGames(Array.isArray(gamesData) ? gamesData : []);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // EFEITO DE SOCKET E CARREGAMENTO INICIAL
  useEffect(() => {
    socket.connect();
    
    // 1. Carrega as salas assim que entra no Lobby
    loadGames();

    // 2. Ouve atualizações em tempo real
    const handleRefresh = () => loadGames();
    
    socket.on("playerJoined", handleRefresh);
    socket.on("gameCreated", handleRefresh); // Caso seu back emita quando alguém cria sala

    return () => {
      socket.off("playerJoined", handleRefresh);
      socket.off("gameCreated", handleRefresh);
      socket.disconnect();
    };
  }, [loadGames]);

  const handleCreateGame = async () => {
    try {
      setCreating(true);
      const response = await gameAPI.create({
        title: "Mesa UNO",
        maxPlayers: 2
      });

      const gameId = response?.data?.id ?? response?.data?.game?.id;

      if (!gameId) throw new Error("ID da sala não retornado");

      // Opcional: emitir via socket que uma sala foi criada (se o back não fizer automático)
      socket.emit("newGameCreated"); 
      
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
      navigate(`/game/${gameId}`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error;

      if (message === "Jogador já está nesta partida") {
        navigate(`/game/${gameId}`);
      } else {
        console.error("Erro ao entrar na sala:", error);
        alert(message || "Não foi possível entrar na sala.");
      }
    }
  };

  return (
    <div
    className="min-h-screen w-full bg-[#b72428] bg-no-repeat bg-left"
    style={{
      backgroundImage: "url('https://i.imgur.com/HWTtTYF.png')",
      backgroundSize: "contain"
    }}
  >

   <header className="bg-black/20 border-b border-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            🎴 UNO Cards
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-bold leading-none">{displayName}</p>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-white/60 hover:text-white text-[10px] uppercase font-black tracking-widest transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tight">
            Mesas disponíveis
          </h2>

          <button
            onClick={handleCreateGame}
            disabled={creating}
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-400 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {creating ? "CRIANDO..." : "CRIAR NOVA SALA"}
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : games.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
            <p className="text-white/40 font-bold text-xl uppercase italic">
              Nenhuma mesa encontrada. Seja o primeiro a criar uma!
            </p>
          </div>
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