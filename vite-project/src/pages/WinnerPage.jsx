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

        const response = await gameAPI.getRanking(id);

        const rankingData =
          response?.data?.ranking ||
          response?.data ||
          [];

        setRanking(rankingData);

      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
      }
    };

    if (id) {
      fetchRanking();
    }

  }, [id]);

  return (
    <div className="p-10 text-center">

      <h1 className="text-3xl font-bold mb-6">
        Winner of the Game
      </h1>

      <ul className="mb-6">

        {ranking.map((player) => (
          <li key={player.playerId}>
            {player.position}º Player ID: {player.playerId} - {player.score} pts
          </li>
        ))}

      </ul>

      <button
        onClick={() => navigate("/lobby")}
        className="bg-blue-500 text-white px-6 py-3 rounded-xl"
      >
        Return to Lobby
      </button>

    </div>
  );
}