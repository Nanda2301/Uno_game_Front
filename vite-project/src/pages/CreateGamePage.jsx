import { useNavigate } from "react-router-dom";

export default function CreateGamePage() {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/game");
  };

  return (
    <div>
      <h1>CREATE GAME</h1>

      <input placeholder="Room Name" />
      <input placeholder="Number of Players (2-10)" />
      <input placeholder="Room Password" />

      <button onClick={handleCreate}>CREATE MATCH</button>
      <button onClick={() => navigate("/lobby")}>RETURN</button>
    </div>
  );
}