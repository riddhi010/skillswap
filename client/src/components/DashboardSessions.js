import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardSessions = ({ userId }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    axios.get(`https://localhost:5000/api/sessions/user/${userId}`)
      .then(res => setSessions(res.data));
  }, [userId]);

  return (
    <div>
      <h3>My Sessions</h3>
      {sessions.map((s, i) => (
        <div key={i} style={{ border: "1px solid gray", marginBottom: 10 }}>
          <p><strong>Skill:</strong> {s.skill}</p>
          <p><strong>With:</strong> {s.requester._id === userId ? s.responder.username : s.requester.username}</p>
          <p><strong>Status:</strong> {s.status}</p>
          <p><strong>Scheduled:</strong> {new Date(s.scheduledTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardSessions;
