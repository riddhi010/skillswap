import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinSessionForm = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (username.trim() && roomId.trim()) {
      navigate(`/live/${username}/${roomId}`);
    } else {
      alert("Please enter both username and room ID.");
    }
  };

  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh"}}>
      <h1>Join Live Session</h1>
      <input
        type="text"
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{marginBottom: "10px", padding: "8px"}}
      />
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{marginBottom: "10px", padding: "8px"}}
      />
      <button onClick={handleJoin} style={{padding:"8px 16px"}}>
        Join
      </button>
    </div>
  );
};

export default JoinSessionForm;
