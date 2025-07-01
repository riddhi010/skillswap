import React, { useState, useEffect } from "react";
import axios from "axios";

const ExploreUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [skill, setSkill] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [sessionData, setSessionData] = useState({ skill: "", message: "", date: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("https://skillswap-backend-jxyu.onrender.com/api/users", {
          params: { role, skill, page, limit: 5 },
        });
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role, skill, page]);
  const handleRequestSession = (user) => {
  setSelectedUser(user);
  setSessionData({ skill: "", message: "", date: "" });
  setShowModal(true);
};
const submitRequest = async () => {
  try {
    await axios.post("https://skillswap-backend-jxyu.onrender.com/api/sessions", {
      
      mentorId: selectedUser._id,
      skill: sessionData.skill,
      scheduledAt: sessionData.date,
      message: sessionData.message,
    },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
    alert("Session request sent successfully!");
    setShowModal(false);
  } catch (error) {
    alert("Failed to send session request.");
    console.error(error);
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🔍 Explore Users</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <select
          className="px-4 py-2 border rounded-md shadow-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="mentor">Mentor</option>
          <option value="both">Both</option>
        </select>

        <input
          type="text"
          placeholder="Search by skill..."
          className="px-4 py-2 border rounded-md shadow-sm w-full md:w-1/2"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-600">No users found.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {users.map((user) => (
  <div
    key={user._id}
    className="border rounded-xl p-4 shadow hover:shadow-lg transition"
  >
    <h3 className="text-lg font-semibold text-indigo-600">{user.name}</h3>
    <p className="text-sm text-gray-600 mb-1 capitalize">Role: {user.role}</p>
    <p className="text-sm">
      <span className="font-medium">Skills:</span> {user.skills.join(", ")}
    </p>

    <button
      onClick={() => handleRequestSession(user)}
      className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
    >
      Request Session
    </button>
  </div>
))}

        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 rounded-md ${
            page <= 1 ? "bg-gray-300" : "bg-indigo-500 text-white hover:bg-indigo-600"
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
            page >= totalPages ? "bg-gray-300" : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          Next
        </button>
      </div>
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">
        Request Session with {selectedUser.name}
      </h3>

      <input
        type="text"
        placeholder="Skill"
        className="w-full mb-3 px-3 py-2 border rounded"
        value={sessionData.skill}
        onChange={(e) => setSessionData({ ...sessionData, skill: e.target.value })}
      />

      <input
        type="datetime-local"
        className="w-full mb-3 px-3 py-2 border rounded"
        value={sessionData.date}
        onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
      />

      <textarea
        placeholder="Message"
        className="w-full mb-4 px-3 py-2 border rounded"
        value={sessionData.message}
        onChange={(e) => setSessionData({ ...sessionData, message: e.target.value })}
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
