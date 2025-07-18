import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";
const USERS_API  = `${API_BASE}/api/users`;
const SESS_API   = `${API_BASE}/api/sessions`;

/* helper → convert /uploads/… to full URL */
const getAvatar = (path) =>
  path
    ? path.startsWith("http")
      ? path
      : `${API_BASE}${path.startsWith("/") ? path : "/" + path}`
    : "/default_avatar.png";

const ExploreUsers = () => {
  const [users, setUsers]           = useState([]);
  const [role, setRole]             = useState("");
  const [skill, setSkill]           = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  /* modal + session state */
  const [showModal, setShowModal]         = useState(false);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [sessionData, setSessionData]     = useState({
    skill: "", message: "", date: ""
  });

  const token = localStorage.getItem("token");

  /* fetch users whenever filters / page change */
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); setError("");
      try {
        const { data } = await axios.get(USERS_API, {
          params: { role, skill, page, limit: 5 },
        });
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [role, skill, page]);

  /* open modal */
  const handleRequestSession = (user) => {
    setSelectedUser(user);
    setSessionData({ skill: "", message: "", date: "" });
    setShowModal(true);
  };

  /* send session request */
  const submitRequest = async () => {
    try {
      await axios.post(
        SESS_API,
        {
          mentorId: selectedUser._id,
          skill: sessionData.skill,
          scheduledAt: sessionData.date,
          message: sessionData.message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Session request sent successfully!");
      setShowModal(false);
    } catch (err) {
      alert("Failed to send session request.");
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🔍 Explore Users</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm"
        >
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="mentor">Mentor</option>
          <option value="both">Both</option>
        </select>

        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          type="text"
          placeholder="Search by skill..."
          className="px-4 py-2 border rounded-md shadow-sm w-full md:w-1/2"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div
              key={u._id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={getAvatar(u.avatar)}
                  alt={u.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600">
                    {u.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    Role: {u.role}
                  </p>
                </div>
              </div>

              <p className="text-sm">
                <span className="font-medium">Skills:</span>{" "}
                {u.skills.join(", ")}
              </p>

              <button
                onClick={() => handleRequestSession(u)}
                className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Request Session
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 rounded-md ${
            page <= 1
              ? "bg-gray-300"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          Previous
        </button>

        <span className="text-gray-700 font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 rounded-md ${
            page >= totalPages
              ? "bg-gray-300"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          Next
        </button>
      </div>

      {/* Session Request Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Request Session with {selectedUser.name}
            </h3>

            <input
              type="text"
              placeholder="Skill"
              value={sessionData.skill}
              onChange={(e) =>
                setSessionData({ ...sessionData, skill: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 border rounded"
            />

            <input
              type="datetime-local"
              value={sessionData.date}
              onChange={(e) =>
                setSessionData({ ...sessionData, date: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 border rounded"
            />

            <textarea
              placeholder="Message"
              value={sessionData.message}
              onChange={(e) =>
                setSessionData({ ...sessionData, message: e.target.value })
              }
              className="w-full mb-4 px-3 py-2 border rounded"
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreUsers;
