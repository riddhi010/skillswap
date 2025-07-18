import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import MentorInbox from "./MentorInbox";
import NotificationBell from "./NotificationBell";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [userId, setUserId]   = useState("");
  const [menuOpen, setMenuOpen] = useState(false);          // ⬅ mobile state

  /* ───────── data fetch ───────── */
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
      const { data } = await axios.get(`https://skillswap-backend-jxyu.onrender.com/api/sessions/user/${id}`);
      setSessions(data.sessions);
    } catch (err) {
      console.error("Error fetching sessions", err);
    }
  };

  /* ───────── session splits ───────── */
  const now = new Date();
  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) >= now);
  const pastSessions     = sessions.filter((s) => new Date(s.scheduledAt) < now);

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
  {/* Brand */}
  <Link to="/" className="text-xl font-bold text-indigo-600">
    SkillSwap
  </Link>

  {/* Right section with bell and menu */}
  <div className="flex items-center gap-4">
    {/* Always visible bell icon */}
    <NotificationBell />

    {/* Hamburger menu (mobile only) */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="text-indigo-600 md:hidden"
    >
      {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
    </button>

    {/* Links (desktop only) */}
    <div className="hidden md:flex items-center gap-6">
      <Link to="/explore" className="navLink">Explore Users</Link>
      <Link to="/live" className="navLink">Live Session</Link>
      <Link to="/wall" className="navLink">Public Wall</Link>
      <Link to="/profile" className="text-2xl text-gray-700 hover:text-indigo-600">
        <FaUserCircle />
      </Link>
    </div>
  </div>
</nav>

{/* Mobile dropdown links (excluding bell) */}
{menuOpen && (
  <div className="bg-white md:hidden shadow px-6 py-4 space-y-4">
    <Link onClick={() => setMenuOpen(false)} to="/explore" className="block navLink">
      Explore Users
    </Link>
    <Link onClick={() => setMenuOpen(false)} to="/live" className="block navLink">
      Live Session
    </Link>
    <Link onClick={() => setMenuOpen(false)} to="/wall" className="block navLink">
      Public Wall
    </Link>
    <Link
      onClick={() => setMenuOpen(false)}
      to="/profile"
      className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
    >
      <FaUserCircle className="text-2xl" /> Profile
    </Link>
  </div>
)}


      {/* Dashboard Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Welcome to your Dashboard
        </h1>

        <MentorInbox />

        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <p className="text-gray-500">No upcoming sessions</p>
          ) : (
            upcomingSessions.map((s) => (
              <div key={s._id} className="bg-white p-4 shadow rounded mb-3">
                <p><strong>Skill:</strong> {s.skill}</p>
                <p><strong>Date:</strong> {new Date(s.scheduledAt).toLocaleString()}</p>
                <p><strong>With:</strong> {s.mentor._id === userId ? s.learner.name : s.mentor.name}</p>
              </div>
            ))
          )}
        </section>

        {/* Past */}
        <section>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Past Sessions</h2>
          {pastSessions.length === 0 ? (
            <p className="text-gray-500">No past sessions</p>
          ) : (
            pastSessions.map((s) => (
              <div key={s._id} className="bg-white p-4 shadow rounded mb-3">
                <p><strong>Skill:</strong> {s.skill}</p>
                <p><strong>Date:</strong> {new Date(s.scheduledAt).toLocaleString()}</p>
                <p><strong>With:</strong> {s.mentor._id === userId ? s.learner.name : s.mentor.name}</p>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
