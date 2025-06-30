import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      fetchSessions(decoded.id);
    }
  }, []);

  const fetchSessions = async (id) => {
    try {
      const res = await axios.get(`https://skillswap-backend-jxyu.onrender.com/api/sessions/user/${id}`);
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Error fetching sessions", err);
    }
  };

  const now = new Date();

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) >= now
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) < now
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-indigo-600">SkillSwap</h2>
        <div className="flex items-center space-x-6">
          <Link to="/explore" className="text-gray-700 hover:text-indigo-600 font-medium">Explore Users</Link>
          <Link to="/live" className="text-gray-700 hover:text-indigo-600 font-medium">Live Session</Link>
          <Link to="/profile" className="text-gray-700 hover:text-indigo-600 text-2xl">
            <FaUserCircle />
          </Link>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to your Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <p className="text-gray-500">No upcoming sessions</p>
          ) : (
            upcomingSessions.map((session) => (
              <div key={session._id} className="bg-white p-4 shadow rounded mb-3">
                <p><strong>Skill:</strong> {session.skill}</p>
                <p><strong>Date:</strong> {new Date(session.scheduledAt).toLocaleString()}</p>
                <p><strong>With:</strong> {session.mentor._id === userId ? session.learner.name : session.mentor.name}</p>
              </div>
            ))
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Past Sessions</h2>
          {pastSessions.length === 0 ? (
            <p className="text-gray-500">No past sessions</p>
          ) : (
            pastSessions.map((session) => (
              <div key={session._id} className="bg-white p-4 shadow rounded mb-3">
                <p><strong>Skill:</strong> {session.skill}</p>
                <p><strong>Date:</strong> {new Date(session.scheduledAt).toLocaleString()}</p>
                <p><strong>With:</strong> {session.mentor._id === userId ? session.learner.name : session.mentor.name}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
