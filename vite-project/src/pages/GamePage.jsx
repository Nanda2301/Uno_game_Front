import { useNavigate } from "react-router-dom";

export default function GamePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>UNO GAME</h1>

      <p>Game running...</p>

      <button onClick={() => navigate("/winner")}>
        END GAME (SIMULATION)
      </button>
    </div>
  );
}