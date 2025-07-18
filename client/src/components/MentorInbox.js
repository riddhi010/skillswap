import React, { useEffect, useState } from "react";
import axios from "axios";

const MentorInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchInbox = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleResponse = async (id, action) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/sessions/${id}`,
      { action },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Optional: Show alert or toast to mentor
    if (action === "accept" && res.data.meetingId) {
      alert(`Session accepted ✅\nMeeting link: /live/${res.data.meetingId}`);
    } else if (action === "reject") {
      alert("Session rejected ❌");
    }

    fetchInbox(); // Refresh the session requests list
  } catch (err) {
    console.error("Failed to update session");
    alert("Something went wrong while responding to the request.");
  }
};


  if (loading) return <p>Loading inbox...</p>;

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h3 className="text-xl font-semibold mb-4">📩 Session Requests</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending session requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req._id} className="border p-4 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={
                    req.learner.avatar
                      ? req.learner.avatar.startsWith("http")
                        ? req.learner.avatar
                        : `http://localhost:5000${req.learner.avatar}`
                      : "/default_avatar.png"
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{req.learner.name}</p>
                  <p className="text-sm text-gray-600">
                    Requested: {new Date(req.scheduledAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mb-2"><strong>Skill:</strong> {req.skill}</p>
              <p className="mb-2"><strong>Message:</strong> {req.message}</p>
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleResponse(req._id, "accept")}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(req._id, "reject")}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentorInbox;
