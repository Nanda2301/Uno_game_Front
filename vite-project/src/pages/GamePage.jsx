import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gameAPI } from "../services/api";

// ─── Utilitários ──────────────────────────────────────────────────────────────

function Spinner({ size = 20, className = "" }) {
  return (
    <svg style={{ width: size, height: size }} className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// Mapeia cor do backend → classes CSS
// Backend: color = "red" | "blue" | "green" | "yellow" | "black"  (src/models/Card.js)
const CARD_COLORS = {
  red:    { bg: "bg-red-600",    border: "border-red-500",    text: "text-red-300",    ring: "ring-red-500"    },
  blue:   { bg: "bg-blue-600",   border: "border-blue-500",   text: "text-blue-300",   ring: "ring-blue-500"   },
  green:  { bg: "bg-emerald-600",border: "border-emerald-500",text: "text-emerald-300",ring: "ring-emerald-500"},
  yellow: { bg: "bg-yellow-500", border: "border-yellow-400", text: "text-yellow-200", ring: "ring-yellow-400" },
  black:  { bg: "bg-gray-900",   border: "border-gray-600",   text: "text-gray-200",   ring: "ring-gray-500"   },
};

// Backend: value = "0"-"9" | "skip" | "reverse" | "draw2" | "wild" | "wild_draw4"
const VALUE_LABEL = {
  skip:       "⊘",
  reverse:    "⇄",
  draw2:      "+2",
  wild:       "★",
  wild_draw4: "+4",
};

function getValueLabel(value) {
  return VALUE_LABEL[value] ?? value;
}

// ─── Componente de carta ──────────────────────────────────────────────────────

function UnoCard({ card, onClick, selected, disabled, mini = false }) {
  if (!card) return null;
  const colors = CARD_COLORS[card.color] ?? CARD_COLORS.black;
  const label = getValueLabel(card.value);
  const isSpecial = isNaN(label) || card.color === "black";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-xl border-2 transition-all duration-150 select-none
        ${mini ? "w-10 h-14 text-xs" : "w-16 h-24 text-sm"}
        ${colors.bg} ${colors.border}
        ${selected ? `ring-2 ring-offset-2 ring-offset-gray-900 ${colors.ring} -translate-y-3 scale-105` : ""}
        ${!disabled && !selected ? "hover:-translate-y-2 hover:scale-105 cursor-pointer" : ""}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        shadow-lg
      `}
    >
      {/* Oval central */}
      <div className={`absolute inset-1.5 rounded-lg bg-white/15 flex items-center justify-center`}>
        <span className={`font-black ${mini ? "text-sm" : "text-xl"} text-white drop-shadow`}>
          {label}
        </span>
      </div>
      {/* Canto superior esquerdo */}
      <span className={`absolute top-0.5 left-1 text-[9px] font-black text-white/70`}>{label}</span>
      {/* Canto inferior direito (invertido) */}
      <span className={`absolute bottom-0.5 right-1 text-[9px] font-black text-white/70 rotate-180`}>{label}</span>

      {isSpecial && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      )}
    </button>
  );
}

// ─── Carta virada (baralho / cartas dos oponentes) ────────────────────────────

function CardBack({ mini = false }) {
  return (
    <div className={`
      ${mini ? "w-10 h-14" : "w-16 h-24"}
      rounded-xl border-2 border-gray-700 bg-gray-900 relative overflow-hidden shadow-lg shrink-0
    `}>
      <div className="absolute inset-1.5 rounded-lg bg-red-700/20 border border-red-600/30 flex items-center justify-center">
        <span className="font-black text-red-500/50 text-lg">U</span>
      </div>
    </div>
  );
}

// ─── Status da partida ────────────────────────────────────────────────────────

function GameStatusBadge({ status }) {
  const map = {
    waiting:     { label: "Aguardando", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    in_progress: { label: "Em andamento", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
    finished:    { label: "Finalizado", cls: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  };
  const info = map[status] ?? map.waiting;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${info.cls}`}>
      {info.label}
    </span>
  );
}

// ─── Toast de notificação ─────────────────────────────────────────────────────

function Toast({ message, type = "info", onClose }) {
  const colors = {
    info:    "bg-blue-500/20 border-blue-500/40 text-blue-300",
    success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    error:   "bg-red-500/20 border-red-500/40 text-red-300",
    warning: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  };
  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      px-5 py-3 rounded-xl border text-sm font-medium shadow-xl
      flex items-center gap-3 max-w-sm
      ${colors[type]}
    `}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── GamePage principal ───────────────────────────────────────────────────────

export default function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("id");
  const { user } = useAuth();

  // Estado do jogo
  const [game, setGame] = useState(null);
  const [myHand, setMyHand] = useState([]);           // GET /:id/myhand
  const [gameState, setGameState] = useState(null);   // GET /:id/state → { jogadorAtual, cartaNoTopo }
  const [ranking, setRanking] = useState([]);          // GET /:id/ranking

  // Estado UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState("");

  // ── Utilitário de toast ──
  function showToast(message, type = "info", duration = 3500) {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }

  // ── Carrega todos os dados da partida ──
  const fetchAll = useCallback(async () => {
    if (!gameId) {
      setError("ID da partida não encontrado.");
      setLoading(false);
      return;
    }
    try {
      // GET /api/games/:id → inclui players[] via GameRepository.findById(id, false)
      const gameRes = await gameAPI.get(gameId);
      const gameData = gameRes.data?.data ?? gameRes.data;
      setGame(gameData);

      if (gameData?.status === "in_progress") {
        // GET /api/games/:id/myhand
        const handRes = await gameAPI.getHand(gameId).catch(() => ({ data: [] }));
        setMyHand(Array.isArray(handRes.data) ? handRes.data : handRes.data?.data ?? []);

        // GET /api/games/:id/state → { jogadorAtual, cartaNoTopo }
        const stateRes = await gameAPI.getState(gameId).catch(() => ({ data: {} }));
        setGameState(stateRes.data);

        // GET /api/games/:id/ranking
        const rankRes = await gameAPI.getRanking(gameId).catch(() => ({ data: { ranking: [] } }));
        setRanking(rankRes.data?.ranking ?? rankRes.data?.value?.ranking ?? []);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erro ao carregar a partida."
      );
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Determina se é a vez do usuário ──
  // Backend: gameState.jogadorAtual é um GamePlayer com playerId
  const isMyTurn = gameState?.jogadorAtual?.playerId === user?.id;

  // ── Ações do jogo ──

  async function handleReady() {
    setActionLoading("ready");
    try {
      // POST /api/games/:id/ready
      await gameAPI.ready(gameId);
      showToast("Você está pronto!", "success");
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao marcar como pronto.", "error");
    } finally {
      setActionLoading("");
    }
  }

  async function handleStart() {
    setActionLoading("start");
    try {
      // POST /api/games/:id/start
      await gameAPI.start(gameId);
      showToast("Partida iniciada!", "success");
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao iniciar a partida.", "error");
    } finally {
      setActionLoading("");
    }
  }

  async function handlePlayCard() {
    if (!selectedCard) return;
    setActionLoading("play");
    try {
      // POST /api/games/:id/play → body: { cardId }
      const res = await gameAPI.playCard(gameId, selectedCard.id);
      const data = res.data?.data ?? res.data;
      const played = data?.playedCard;
      showToast(
        played
          ? `Carta jogada: ${played.color} ${getValueLabel(played.value)}`
          : "Carta jogada!",
        "success"
      );
      setSelectedCard(null);
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Jogada inválida.", "error");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDraw() {
    setActionLoading("draw");
    try {
      // POST /api/games/:id/comprar
      const res = await gameAPI.drawCard(gameId);
      const data = res.data?.data ?? res.data;
      showToast(
        data?.canPlay
          ? "Carta comprada — você pode jogá-la!"
          : "Carta comprada. Turno passado.",
        data?.canPlay ? "warning" : "info"
      );
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao comprar carta.", "error");
    } finally {
      setActionLoading("");
    }
  }

  async function handleUno() {
    setActionLoading("uno");
    try {
      // POST /api/games/:id/uno (se tiver rota) ou via gameAPI.uno
      await gameAPI.sayUno?.(gameId);
      showToast("UNO! 🎉", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao dizer UNO.", "error");
    } finally {
      setActionLoading("");
    }
  }

  async function handleLeave() {
    if (!window.confirm("Deseja abandonar a partida?")) return;
    try {
      // POST /api/games/:id/leave
      await gameAPI.leave(gameId);
      navigate("/lobby");
    } catch {
      navigate("/lobby");
    }
  }

  // ── Carta no topo do descarte ──
  // Backend: gameState.cartaNoTopo é um Result.value com shape {color, value, ...}
  const topCard = gameState?.cartaNoTopo?.value ?? gameState?.cartaNoTopo ?? null;

  // ── Jogador da vez ──
  const currentPlayerName = gameState?.jogadorAtual
    ? `Jogador #${gameState.jogadorAtual.playerId}`
    : "—";

  // ── Renderização de loading / erro ──

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Spinner size={32} />
          <span className="text-sm">Carregando partida...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/lobby")}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ← Voltar ao Lobby
          </button>
        </div>
      </div>
    );
  }

  const isCreator = game?.creatorId === user?.id;
  const myPlayerEntry = game?.players?.find(p => p.playerId === user?.id);
  const isReady = myPlayerEntry?.ready ?? false;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Fundo decorativo */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(220,38,38,0.06) 0%, transparent 70%)"
      }} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-xs font-black shrink-0">U</div>
          {/* Backend: Game.title */}
          <h1 className="font-bold text-base truncate">{game?.title || `Sala #${gameId}`}</h1>
          <GameStatusBadge status={game?.status} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAll}
            title="Atualizar"
            className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            ↺
          </button>
          <button
            onClick={handleLeave}
            className="text-xs text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sair
          </button>
          <button
            onClick={() => navigate("/lobby")}
            className="text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Lobby
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 gap-5">

        {/* ── SALA EM ESPERA ── */}
        {game?.status === "waiting" && (
          <div className="flex flex-col gap-5">
            {/* Info da sala */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Sala de Espera</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Máx. Jogadores</p>
                  <p className="font-semibold">{game.maxPlayers}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Na Sala</p>
                  <p className="font-semibold">{game.players?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Criador</p>
                  <p className="font-semibold">#{game.creatorId}</p>
                </div>
              </div>
            </div>

            {/* Lista de jogadores */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">
                Jogadores ({game.players?.length ?? 0}/{game.maxPlayers})
              </h3>
              <div className="flex flex-col gap-2">
                {(game.players ?? []).map((p, i) => (
                  // GamePlayer: playerId, ready, position, score (src/models/GamePlayer.js)
                  <div key={p.id ?? i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                      {p.position}
                    </div>
                    <span className="text-sm flex-1">
                      Jogador #{p.playerId}
                      {p.playerId === user?.id && <span className="ml-2 text-xs text-gray-500">(você)</span>}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      p.ready
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
                        : "text-gray-500 bg-gray-500/10 border-gray-500/20"
                    }`}>
                      {p.ready ? "✓ Pronto" : "Esperando"}
                    </span>
                  </div>
                ))}

                {/* Slots vazios */}
                {Array.from({ length: Math.max(0, (game.maxPlayers ?? 0) - (game.players?.length ?? 0)) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-dashed border-white/10">
                    <div className="w-7 h-7 rounded-full border border-dashed border-gray-700 flex items-center justify-center text-gray-700 text-xs">
                      ?
                    </div>
                    <span className="text-sm text-gray-600">Aguardando jogador...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações da sala */}
            <div className="flex gap-3 flex-wrap">
              {!isReady && (
                <button
                  onClick={handleReady}
                  disabled={actionLoading === "ready"}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {actionLoading === "ready" ? <Spinner size={14} /> : "✓"}
                  Estou Pronto
                </button>
              )}
              {isCreator && (
                <button
                  onClick={handleStart}
                  disabled={actionLoading === "start"}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {actionLoading === "start" ? <Spinner size={14} /> : "▶"}
                  Iniciar Partida
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── JOGO EM ANDAMENTO ── */}
        {game?.status === "in_progress" && (
          <div className="flex flex-col gap-5">
            {/* Turno atual */}
            <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
              isMyTurn
                ? "bg-red-500/10 border-red-500/30"
                : "bg-white/[0.03] border-white/10"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                isMyTurn ? "bg-red-500/20" : "bg-white/5"
              }`}>
                {isMyTurn ? "🎯" : "⏳"}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Vez de jogar</p>
                <p className="font-bold text-sm">
                  {isMyTurn ? "É a sua vez!" : currentPlayerName}
                </p>
              </div>
              {/* Direção do jogo: game.direction 1 = horário, -1 = anti-horário */}
              <div className="ml-auto text-xl" title={`Direção: ${game.direction === 1 ? "Horário" : "Anti-horário"}`}>
                {game.direction === 1 ? "↻" : "↺"}
              </div>
            </div>

            {/* Mesa: carta no topo */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Topo do Descarte</p>
                {topCard ? (
                  <UnoCard card={topCard} disabled />
                ) : (
                  <div className="w-16 h-24 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-700 text-xs">
                    Vazia
                  </div>
                )}
              </div>

              {/* Baralho de compra */}
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Comprar</p>
                <button
                  onClick={handleDraw}
                  disabled={!isMyTurn || actionLoading === "draw"}
                  className="disabled:cursor-not-allowed group relative"
                  title={isMyTurn ? "Comprar carta" : "Não é sua vez"}
                >
                  <div className={`transition-transform duration-150 ${isMyTurn && !actionLoading ? "group-hover:-translate-y-1" : ""}`}>
                    <CardBack />
                  </div>
                  {actionLoading === "draw" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner size={20} className="text-white" />
                    </div>
                  )}
                </button>
                {isMyTurn && (
                  <p className="text-xs text-gray-500 mt-1">Clique para comprar</p>
                )}
              </div>
            </div>

            {/* Mão do jogador */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">Sua Mão</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{myHand.length} cartas</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Dizer UNO quando tiver 1 carta */}
                  {myHand.length === 1 && (
                    <button
                      onClick={handleUno}
                      disabled={actionLoading === "uno"}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-lg transition-colors animate-pulse"
                    >
                      UNO!
                    </button>
                  )}
                  {/* Jogar carta selecionada */}
                  {selectedCard && isMyTurn && (
                    <button
                      onClick={handlePlayCard}
                      disabled={actionLoading === "play"}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {actionLoading === "play" ? <Spinner size={14} /> : null}
                      Jogar carta
                    </button>
                  )}
                </div>
              </div>

              {myHand.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-4">Sem cartas na mão</p>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {myHand.map((card) => (
                    <UnoCard
                      key={card.id}
                      card={card}
                      selected={selectedCard?.id === card.id}
                      disabled={!isMyTurn}
                      onClick={() => setSelectedCard(
                        selectedCard?.id === card.id ? null : card
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Outros jogadores */}
            {game.players && game.players.length > 1 && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">
                  Jogadores na Mesa
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {game.players.map((p) => {
                    // GamePlayer: playerId, position, score, ready
                    const isCurrentTurn = gameState?.jogadorAtual?.playerId === p.playerId;
                    const isMe = p.playerId === user?.id;
                    return (
                      <div
                        key={p.id}
                        className={`rounded-xl border p-3 transition-all ${
                          isCurrentTurn
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-white/[0.02] border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCurrentTurn ? "bg-red-500/30 text-red-300" : "bg-gray-800 text-gray-400"
                          }`}>
                            {p.position}
                          </div>
                          <span className="text-xs font-medium truncate">
                            {isMe ? "Você" : `#${p.playerId}`}
                          </span>
                          {isCurrentTurn && <span className="ml-auto text-xs">🎯</span>}
                        </div>
                        {/* Cartas do oponente (viradas) — só contagem disponível sem revelar */}
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(7, 3) }).map((_, i) => (
                            <CardBack key={i} mini />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Score: {p.score}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ranking */}
            {ranking.length > 0 && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">
                  Ranking da Partida
                </h3>
                <div className="flex flex-col gap-2">
                  {ranking.map((r) => (
                    // Backend: { position, playerId, score }  (GameService.obterRankingPartida)
                    <div key={r.playerId} className="flex items-center gap-3 text-sm">
                      <span className="w-5 text-gray-500 text-xs">{r.position}.</span>
                      <span className="flex-1 text-gray-300">Jogador #{r.playerId}</span>
                      <span className="font-semibold">{r.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PARTIDA FINALIZADA ── */}
        {game?.status === "finished" && (
          <div className="flex flex-col gap-5">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="font-black text-2xl mb-2">Partida Encerrada</h2>
              <p className="text-gray-500 text-sm mb-6">{game.title}</p>

              {ranking.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">Resultado Final</h3>
                  <div className="flex flex-col gap-2 text-left max-w-sm mx-auto">
                    {ranking.map((r) => (
                      <div key={r.playerId} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
                        <span className="text-lg">
                          {r.position === 1 ? "🥇" : r.position === 2 ? "🥈" : r.position === 3 ? "🥉" : `${r.position}.`}
                        </span>
                        <span className="flex-1 text-sm">Jogador #{r.playerId}</span>
                        <span className="font-semibold text-sm">{r.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/lobby")}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
              >
                Voltar ao Lobby
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}