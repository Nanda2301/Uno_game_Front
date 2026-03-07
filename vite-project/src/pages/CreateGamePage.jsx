import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameAPI } from "../services/api";

export default function CreateGamePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", maxPlayers: 4 });

  const handleCreate = async () => {
    try {
      const response = await gameAPI.create(formData);
      // O backend retorna o jogo criado; vamos para a sala do jogo
      navigate(`/game/${response.data.id}`); 
    } catch (error) {
      alert("Erro ao criar partida: " + error.response?.data?.message);
    }
  };

  return (
    <div>
      <h1>CREATE GAME</h1>
      <input 
        placeholder="Room Name" 
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
      <input 
        type="number"
        placeholder="Max Players (2-10)" 
        onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
      />
      <button onClick={handleCreate}>CREATE MATCH</button>
      <button onClick={() => navigate("/lobby")}>RETURN</button>
    </div>
  );
}