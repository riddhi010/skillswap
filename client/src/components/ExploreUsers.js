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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
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

  return (
    <div>
      <h2>Explore Users</h2>

      {/* Filters */}
      <div>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="mentor">Mentor</option>
          <option value="both">Both</option>
        </select>

        <input
          type="text"
          placeholder="Search by skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
      </div>

      {/* Users List */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              <strong>{user.name}</strong> - {user.role}
              <br />
              Skills: {user.skills.join(", ")}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ExploreUsers;
