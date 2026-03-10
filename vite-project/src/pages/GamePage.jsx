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

function isValidCard(card) {
  if (!card || typeof card !== 'object') return false;
  const { color, value } = card;
  const especiais = ['+2', '+4', 'coringa', 'reverse', 'skip'];
  return color != null && value != null && !especiais.includes(String(value).toLowerCase());
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
    setLoading(true);
    setError("");
    try {
      const gameRes = await gameAPI.get(gameId);
      const gameData = gameRes.data?.data ?? gameRes.data;
      setGame(gameData);

      if (gameData?.status === "in_progress") {
        const [handRes, stateRes] = await Promise.allSettled([
          gameAPI.getHand(gameId),
          gameAPI.getState(gameId)
        ]);

        if (handRes.status === "fulfilled") {
          const hand = handRes.value.data ?? [];
          setMyHand(Array.isArray(hand) ? hand.slice(0, 7) : []);
        }

        if (stateRes.status === "fulfilled") {
          const stateData = stateRes.value.data;
          const playerIds = gameData.players.map(p => p.playerId);
          let turnoValido = playerIds.includes(stateData.jogadorAtual) ? stateData.jogadorAtual : playerIds[0];
          setGameState({ ...stateData, jogadorAtual: turnoValido });
        }
      }
    } catch (err) {
      console.error("Erro no fetchAll:", err.response?.data ?? err);
      setError("Erro ao carregar a partida.");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    socket.connect();
    socket.emit("joinGame", gameId);

    const handleUpdate = () => fetchAll();

    ["playerJoined", "gameStarted", "cardPlayed", "cardDrawn", "turnChanged"].forEach(evt =>
      socket.on(evt, handleUpdate)
    );

    return () => {
      ["playerJoined", "gameStarted", "cardPlayed", "cardDrawn", "turnChanged"].forEach(evt =>
        socket.off(evt, handleUpdate)
      );
      socket.disconnect();
    };
  }, [gameId, fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // --- AÇÕES ---
  const handleReady = async () => { try { await gameAPI.ready(gameId); fetchAll(); } catch (err) { alert("Erro ao confirmar ready."); console.error(err); } };
  const handleStartGame = async () => { try { await gameAPI.start(gameId); fetchAll(); } catch (err) { alert("Erro ao iniciar."); console.error(err); } };
  const handleDeleteGame = async () => { if (!window.confirm("Tem certeza que deseja deletar esta sala?")) return; try { await gameAPI.delete(gameId); navigate("/lobby"); } catch (err) { alert("Erro ao deletar a sala."); console.error(err); } };

  const handleLeaveGame = async () => {
    if (!window.confirm("Deseja realmente sair da partida?")) return;
    try {
      await gameAPI.leave(gameId);
      navigate("/lobby");
    } catch (err) {
      alert("Não foi possível sair da partida.");
      console.error(err);
    }
  };

  const handlePlayCard = async (cardId) => {
    try {
      if (!gameState?.cartaNoTopo) {
        alert("O topo do descarte ainda não foi definido. Aguarde o início do jogo!");
        return;
      }
      await gameAPI.playCard(gameId, cardId);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Jogada inválida!");
      console.error(err);
    }
  };

  const handleDrawCard = async () => {
    try {
      if (!gameState?.cartaNoTopo) {
        alert("O jogo ainda não iniciou ou não há carta no topo!");
        return;
      }
      await gameAPI.drawCard(gameId);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Não é sua vez!");
      console.error(err);
    }
  };

  const handleSayUno = async () => { try { await gameAPI.sayUno(gameId); alert("Você gritou UNO!"); } catch (err) { alert("Não pode gritar UNO agora!"); console.error(err); } };
  const handleChallenge = async (targetPlayerId) => { try { await gameAPI.challenge(gameId, targetPlayerId); alert("Desafio enviado!"); fetchAll(); } catch (err) { alert("Não foi possível desafiar."); console.error(err); } };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Spinner size={40}/></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400"><p>{error}</p></div>;

  const currentTurnId = gameState?.jogadorAtual;
  const isMyTurn = String(currentTurnId) === String(user?.id);
  const me = game?.players?.find(p => p.playerId === user?.id);
  const isCreator = game?.creatorId === user?.id;

  // --- LOBBY ---
  if (game?.status === "waiting") {
    return (
      <div className="min-h-screen p-6 bg-[#b72428] text-white flex flex-col items-center justify-center">
        <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md w-full max-w-sm border border-white/20">
          <h2 className="text-2xl font-black mb-2 text-center italic">SALA #{gameId}</h2>
          <p className="text-center text-white/60 text-sm mb-6">{game?.players?.length ?? 0}/{game?.maxPlayers ?? '?'} jogadores</p>
          <div className="flex flex-col gap-2 mb-6">
            {game?.players?.map(p => (
              <div key={p.playerId} className="flex items-center justify-between bg-white/10 px-4 py-2 rounded-xl">
                <span className="text-sm font-semibold">Jogador #{p.playerId}</span>
                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${p.ready ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'}`}>{p.ready ? 'Pronto' : 'Aguardando'}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {!me?.ready && <button onClick={handleReady} className="bg-yellow-400 text-black font-black py-3 rounded-xl uppercase hover:bg-yellow-300 transition-colors">Estou Pronto</button>}
            {isCreator && <button onClick={handleStartGame} className="bg-green-600 text-white font-black py-3 rounded-xl uppercase hover:bg-green-500 transition-colors">Começar Jogo</button>}
            {isCreator && <button onClick={handleDeleteGame} className="bg-red-900/60 border border-red-500/40 text-red-300 font-bold py-2 rounded-xl uppercase text-sm hover:bg-red-800/60 transition-colors">Deletar Sala</button>}
            <button onClick={handleLeaveGame} className="bg-white/10 text-white/70 font-bold py-2 rounded-xl uppercase text-sm hover:bg-white/20 transition-colors">Sair do Jogo</button>
            <button onClick={() => navigate("/lobby")} className="bg-white/10 text-white/70 font-bold py-2 rounded-xl uppercase text-sm hover:bg-white/20 transition-colors">Voltar ao Lobby</button>
          </div>
        </div>
      </div>
    );
  }

  // --- FINAL ---
  if (game?.status === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white flex-col gap-6">
        <h2 className="text-3xl font-black italic">Partida Encerrada!</h2>
        <button onClick={() => navigate(`/winner/${gameId}`)} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-xl uppercase">Ver Resultado</button>
        <button onClick={() => navigate("/lobby")} className="bg-white/10 text-white font-bold px-6 py-2 rounded-xl uppercase text-sm">Voltar ao Lobby</button>
      </div>
    );
  }

  // --- MESA ---
  let topoCarta = gameState?.cartaNoTopo && isValidCard(gameState.cartaNoTopo) ? gameState.cartaNoTopo : myHand.find(isValidCard) || null;
  const opponent = game?.players?.find(p => p.playerId !== user?.id);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col relative overflow-hidden">
      <header className="p-4 flex justify-between items-center bg-black/40 border-b border-white/5 shadow-2xl z-50">
        <h1 className="font-black italic text-xl text-red-600">UNO ARENA</h1>
        <div className={`px-4 py-1 rounded-full text-sm font-black transition-all ${isMyTurn ? 'bg-yellow-400 text-black scale-105' : 'bg-white/10'}`}>{isMyTurn ? "SUA VEZ!" : `TURNO: JOGADOR #${currentTurnId}`}</div>
        <div className="flex gap-2 items-center">
          <div className="px-3 py-1 rounded-full bg-green-600/30 text-green-300 text-xs font-black uppercase border border-green-500/30">Em Jogo</div>
          <button onClick={handleLeaveGame} className="bg-red-700 text-white px-3 py-1 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">Sair da Partida</button>
        </div>
      </header>

      <aside className="absolute left-4 top-24 z-40 flex flex-col gap-4">
        {opponent && (
          <div key={opponent.playerId} className="bg-black/40 p-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold opacity-50 text-center">JOGADOR<br/>#{opponent.playerId}</span>
            <button onClick={() => handleChallenge(opponent.playerId)} className="bg-red-600 hover:bg-red-500 text-[9px] font-black px-2 py-1 rounded uppercase transition-colors">Desafiar!</button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center gap-12 relative">
        <div className="flex items-center gap-16 scale-110 sm:scale-125">
          <div className="flex flex-col items-center gap-2">
            <UnoCard faceDown={true} size="lg" onClick={handleDrawCard} disabled={!isMyTurn}/>
            <span className="text-[10px] font-black opacity-20 uppercase">Baralho</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            {topoCarta ? <UnoCard card={topoCarta} size="lg"/> : <div className="w-24 h-36 border-4 border-dashed border-white/5 rounded-xl flex items-center justify-center"><Spinner /></div>}
            <span className="text-[10px] font-black opacity-20 uppercase">Mesa</span>
          </div>
        </div>

        <button
          onClick={handleSayUno}
          className={`absolute right-10 bottom-10 w-20 h-20 rounded-full border-4 border-white font-black italic text-xl shadow-2xl transition-all active:scale-90 ${myHand.length === 2 ? 'bg-red-600 animate-bounce' : 'bg-gray-800 opacity-40'}`}
        >
          UNO!
        </button>
      </main>

      <footer className="h-60 bg-gradient-to-t from-black flex items-end justify-center pb-10 px-10">
        <div className="flex items-center justify-center -space-x-12 sm:-space-x-10 hover:-space-x-4 transition-all duration-500">
          {myHand.map((card, idx) => (
            <UnoCard key={card.id || idx} card={card} size="lg" onClick={() => handlePlayCard(card.id)} disabled={!isMyTurn} selected={isMyTurn}/>
          ))}
        </div>
      </footer>
    </div>
  );
}