import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gameAPI } from "../services/api";

export default function GamePage() {
  const { id } = useParams(); // Pega o ID do jogo da URL
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [hand, setHand] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar os dados do jogo e a mão do jogador
  const fetchData = async () => {
    try {
      const [gameRes, handRes] = await Promise.all([
        gameAPI.get(id),
        gameAPI.myCards(id) // Usando a função que mapeamos para o backend
      ]);
      setGameState(gameRes.data);
      setHand(handRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados do jogo:", error);
      navigate("/lobby");
    }
  };

  useEffect(() => {
    fetchData();
    // Opcional: Implementar um setInterval para atualizar o estado do jogo (Poll)
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [id]);

  // Função para Jogar uma Carta
  const handlePlayCard = async (cardId) => {
    try {
      const response = await gameAPI.playCard(id, cardId); // Envia o cardId para o backend
      
      // Se o backend retornar que o jogo acabou (status: finished)
      if (response.data.status === 'finished' || response.data.game?.status === 'finished') {
        navigate(`/winner/${id}`);
        return;
      }
      
      fetchData(); // Atualiza a mesa e a mão após a jogada
    } catch (error) {
      alert(error.response?.data?.message || "Não é possível jogar esta carta agora.");
    }
  };

  // Função para Comprar uma Carta
  const handleDrawCard = async () => {
    try {
      await gameAPI.drawCard(id); // Aciona a lógica de compra do backend
      fetchData();
    } catch (error) {
      console.error("Erro ao comprar carta:", error);
    }
  };

  if (loading) return <div>Carregando partida...</div>;

  return (
    <div className="game-container">
      <h1>Partida: {gameState?.title}</h1>
      
      {/* Área da Mesa (Carta no Topo) */}
      <div className="table-area">
        <p>Status: {gameState?.status}</p>
        <div className="top-card">
          Carta no Topo: <strong>{gameState?.topCard?.color} {gameState?.topCard?.value}</strong>
        </div>
      </div>

      <hr />

      {/* Mão do Jogador */}
      <div className="player-hand">
        <h3>Sua Mão:</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {hand.map((card) => (
            <button 
              key={card.id} 
              onClick={() => handlePlayCard(card.id)}
              style={{ backgroundColor: card.color, padding: '10px', color: 'white' }}
            >
              {card.value}
            </button>
          ))}
        </div>
      </div>

      <div className="actions" style={{ marginTop: '20px' }}>
        <button onClick={handleDrawCard}>COMPRAR CARTA</button>
        <button onClick={() => navigate("/lobby")} style={{ marginLeft: '10px' }}>
          SAIR DO JOGO
        </button>
      </div>
    </div>
  );
}