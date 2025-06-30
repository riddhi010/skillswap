import React, { useState } from "react";
import axios from "axios";

const RequestSession = ({ currentUserId, peerId }) => {
  const [skill, setSkill] = useState("");
  const [time, setTime] = useState("");

  const requestSession = async () => {
    const res = await axios.post("https://skillswap-backend-jxyu.onrender.com/api/sessions", {
      skill,
      requesterId: currentUserId,
      responderId: peerId,
      scheduledTime: new Date(time)
    });
    alert("Session Requested Successfully");
  };

  return (
    <div>
      <input placeholder="Skill" value={skill} onChange={e => setSkill(e.target.value)} />
      <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
      <button onClick={requestSession}>Request Session</button>
    </div>
  );
};

export default RequestSession;
