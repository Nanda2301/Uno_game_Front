import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gameAPI } from "../services/api";
import { socket } from "../services/socket";
import UnoCard from "../components/UnoCard"; 

function Spinner({ size = 20 }) {
  return (
    <svg style={{ width: size, height: size }} className="animate-spin text-yellow-400" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.2"/>
      <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

export default function GamePage() {
  const { id: gameId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!gameId) return;
    try {
      const gameRes = await gameAPI.get(gameId);
      const gameData = gameRes.data?.data ?? gameRes.data;
      setGame(gameData);

      if (gameData?.status === "in_progress") {
        const [handRes, stateRes] = await Promise.allSettled([
          gameAPI.getHand(gameId),
          gameAPI.getState(gameId)
        ]);
        
        if (handRes.status === "fulfilled") setMyHand(handRes.value.data ?? []);
        if (stateRes.status === "fulfilled") setGameState(stateRes.value.data);
      }
    } catch (err) {
      setError("Erro ao carregar a partida.");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    socket.connect();
    socket.emit("joinGame", gameId);
    const handleUpdate = () => fetchAll();
    
    socket.on("playerJoined", handleUpdate);
    socket.on("gameStarted", handleUpdate); 
    socket.on("cardPlayed", handleUpdate);
    socket.on("cardDrawn", handleUpdate);
    socket.on("turnChanged", handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [gameId, fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // --- AÇÕES ---
  const handleReady = async () => {
    try { await gameAPI.ready(gameId); fetchAll(); } catch (err) { alert("Erro ao confirmar ready."); }
  };

  const handleStartGame = async () => {
    try { await gameAPI.start(gameId); fetchAll(); } catch (err) { alert("Erro ao iniciar."); }
  };

  const handlePlayCard = async (cardId) => {
    try { await gameAPI.playCard(gameId, cardId); fetchAll(); } catch (err) { alert("Jogada inválida!"); }
  };

  const handleDrawCard = async () => {
    try { await gameAPI.drawCard(gameId); fetchAll(); } catch (err) { alert("Não é sua vez!"); }
  };

  const handleSayUno = async () => {
    try {
      await gameAPI.sayUno(gameId);
      alert("Você gritou UNO!");
    } catch (err) {
      alert("Você não pode gritar UNO agora!");
    }
  };

  const handleChallenge = async (targetPlayerId) => {
    try {
      await gameAPI.challenge(gameId, targetPlayerId);
      alert("Desafio enviado!");
      fetchAll();
    } catch (err) {
      alert("Não foi possível desafiar.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Spinner size={40}/></div>;

  const currentTurnId = gameState?.jogadorAtual?.id || gameState?.jogadorAtual;
  const isMyTurn = String(currentTurnId) === String(user?.id);
  const me = game?.players?.find(p => p.playerId === user?.id);

  if (game?.status === "waiting") {
    return (
      <div className="min-h-screen p-6 bg-[#b72428] text-white flex flex-col items-center justify-center">
        <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md w-full max-w-sm border border-white/20">
          <h2 className="text-2xl font-black mb-6 text-center italic">SALA #{gameId}</h2>
          <div className="flex flex-col gap-4">
            {!me?.ready && <button onClick={handleReady} className="bg-yellow-400 text-black font-black py-3 rounded-xl uppercase">Estou Pronto</button>}
            {game?.creatorId === user?.id && <button onClick={handleStartGame} className="bg-green-600 text-white font-black py-3 rounded-xl uppercase">Começar Jogo</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <header className="p-4 flex justify-between items-center bg-black/40 border-b border-white/5 shadow-2xl z-50">
        <h1 className="font-black italic text-xl text-red-600">UNO ARENA</h1>
        <div className={`px-4 py-1 rounded-full text-sm font-black transition-all ${isMyTurn ? 'bg-yellow-400 text-black scale-105' : 'bg-white/10'}`}>
           {isMyTurn ? "SUA VEZ!" : `TURNO: JOGADOR #${currentTurnId}`}
        </div>
      </header>

      {/* ÁREA DE DESAFIO (OPONENTES) */}
      <aside className="absolute left-4 top-24 z-40 flex flex-col gap-4">
        {game?.players?.filter(p => p.playerId !== user?.id).map(p => (
          <div key={p.playerId} className="bg-black/40 p-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold opacity-50 text-center">JOGADOR<br/>#{p.playerId}</span>
            <button 
              onClick={() => handleChallenge(p.playerId)}
              className="bg-red-600 hover:bg-red-500 text-[9px] font-black px-2 py-1 rounded uppercase transition-colors"
            >
              Desafiar!
            </button>
          </div>
        ))}
      </aside>

      {/* MESA CENTRAL */}
      <main className="flex-1 flex flex-col items-center justify-center gap-12 relative">
        <div className="flex items-center gap-16 scale-110 sm:scale-125">
          <div className="flex flex-col items-center gap-2">
            <UnoCard faceDown={true} size="lg" onClick={handleDrawCard} disabled={!isMyTurn} />
            <span className="text-[10px] font-black opacity-20 uppercase">Baralho</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            {gameState?.cartaNoTopo ? (
              <UnoCard card={gameState.cartaNoTopo} size="lg" />
            ) : (
              <div className="w-24 h-36 border-4 border-dashed border-white/5 rounded-xl flex items-center justify-center"><Spinner /></div>
            )}
            <span className="text-[10px] font-black opacity-20 uppercase">Mesa</span>
          </div>
        </div>

        {/* BOTÃO UNO */}
        <button 
          onClick={handleSayUno}
          className={`absolute right-10 bottom-10 w-20 h-20 rounded-full border-4 border-white font-black italic text-xl shadow-2xl transition-all active:scale-90
            ${myHand.length === 2 ? 'bg-red-600 animate-bounce' : 'bg-gray-800 opacity-40'}
          `}
        >
          UNO!
        </button>
      </main>

      {/* MINHA MÃO */}
      <footer className="h-60 bg-gradient-to-t from-black flex items-end justify-center pb-10 px-10">
        <div className="flex items-center justify-center -space-x-12 sm:-space-x-10 hover:-space-x-4 transition-all duration-500">
          {myHand.map((card, idx) => (
            <UnoCard 
              key={card.id || idx} 
              card={card} 
              size="lg" 
              onClick={() => handlePlayCard(card.id)} 
              disabled={!isMyTurn}
              selected={isMyTurn}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}