import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LobbyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div>
      <h1>UNO LOBBY</h1>

      <button onClick={() => navigate("/create")}>
        CREATE NEW GAME
      </button>

      <button onClick={logout}>LOG OUT</button>
    </div>
  );
}