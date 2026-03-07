import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gameAPI } from "../services/api";

export default function LobbyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [games, setGames] = useState([]);

  // Busca a lista de jogos do backend
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameAPI.list();
        setGames(response.data);
      } catch (error) {
        console.error("Erro ao listar jogos:", error);
      }
    };
    fetchGames();
  }, []);

  const handleJoinGame = async (gameId) => {
    try {
      await gameAPI.join(gameId);
      navigate(`/game/${gameId}`); // Redireciona para a sala específica
    } catch (error) {
      alert(error.response?.data?.message || "Não foi possível entrar no jogo");
    }
  };

  return (
    <div>
      <h1>UNO LOBBY</h1>
      <button onClick={() => navigate("/create")}>CREATE NEW GAME</button>
      <button onClick={logout}>LOG OUT</button>

      <h2>Available Games</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            {game.title} - ({game.status})
            <button onClick={() => handleJoinGame(game.id)}>JOIN</button>
          </li>
        ))}
      </ul>
    </div>
  );
}