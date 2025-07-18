import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
    avatar: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, role, skills, avatar } = res.data;
        setFormData({
          name,
          email,
          role,
          skills: skills.join(", "),
          avatar: avatar || "",
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

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    let avatarUrl = formData.avatar;

    try {
      const token = localStorage.getItem("token");

      // If file is selected, upload it first
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        const uploadRes = await axios.post("http://localhost:5000/api/upload", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        avatarUrl = uploadRes.data.url;
      }

      const payload = {
        ...formData,
        avatar: avatarUrl,
        skills: formData.skills.split(",").map((s) => s.trim()),
      };

      const res = await axios.put(`http://localhost:5000/api/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Profile updated successfully!");
      setFormData({
        ...res.data,
        skills: res.data.skills.join(", "),
      });
      setPreview("");
      setFile(null);
      setEditing(false);
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">My Profile</h2>

      {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
      {message && <p className="text-green-600 mb-3 text-center">{message}</p>}

      {!editing ? (
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <img
  src={
    formData.avatar
      ? formData.avatar.startsWith("http")
        ? formData.avatar
        : `http://localhost:5000${formData.avatar}`
      : "/default_avatar.png"
  }
  alt="avatar"
  className="w-32 h-32 rounded-full object-cover border"
/>

          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="text-lg font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-lg font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Role</p>
              <p className="text-lg font-medium capitalize">{formData.role}</p>
            </div>
            <div>
              <p className="text-gray-500">Skills</p>
              <p className="text-lg font-medium">{formData.skills}</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setEditing(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={preview || formData.avatar || "/default_avatar.png"}
              alt="preview"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded">
              Upload Photo
              <input type="file" accept="image/*" hidden onChange={handleFileChange} />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              value={formData.email}
              disabled
              className="w-full mt-1 px-3 py-2 border bg-gray-100 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded"
            >
              <option value="learner">Learner</option>
              <option value="mentor">Mentor</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Skills</label>
            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded"
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
