import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gameAPI } from "../services/api";

export default function WinnerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await gameAPI.ranking(id);
        setRanking(response.data.ranking); // Padrão retornado pelo GameService.obterRankingPartida
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
      }
    };
    if (id) fetchRanking();
  }, [id]);

  return (
    <div>
      <h1>WINNER OF THE GAME</h1>
      <ul>
        {ranking.map((player) => (
          <li key={player.playerId}>
            {player.position}º Player ID: {player.playerId} - {player.score} pts
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/lobby")}>RETURN TO LOBBY</button>
    </div>
  );
}