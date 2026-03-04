import { useNavigate } from "react-router-dom";

export default function WinnerPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>WINNER OF THE GAME</h1>

      <ul>
        <li>1º Murillo - 200pts</li>
        <li>2º Lara - 100pts</li>
        <li>3º Fernanda - 80pts</li>
      </ul>

      <button onClick={() => navigate("/lobby")}>
        RETURN TO LOBBY
      </button>
    </div>
  );
}