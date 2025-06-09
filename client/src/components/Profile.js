import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    return decoded.id;
  } catch {
    return null;
  }
};

const Profile = () => {
  const userId = getUserIdFromToken();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    skills: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, role, skills } = res.data;
        setFormData({
          name,
          email,
          role,
          skills: skills.join(", "),
        });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()),
      };

      const res = await axios.put(`http://localhost:5000/api/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Profile updated successfully!");
      setFormData({
        ...formData,
        skills: res.data.skills.join(", "),
      });
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>My Profile</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleUpdate}>
        <label>Name:</label>
        <input name="name" value={formData.name} onChange={handleChange} required />

        <label>Email:</label>
        <input name="email" value={formData.email} disabled />

        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="learner">Learner</option>
          <option value="mentor">Mentor</option>
          <option value="both">Both</option>
        </select>

        <label>Skills (comma separated):</label>
        <input name="skills" value={formData.skills} onChange={handleChange} />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
