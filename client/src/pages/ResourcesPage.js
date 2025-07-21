import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadResource from "../components/UploadResource";

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filter, setFilter]       = useState("");
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await axios.get(`https://skillswap-backend-jxyu.onrender.com/api/resources${filter ? "?title=" + filter : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setResources(res.data);
  };

  const handleDelete = async (id) => {
    await axios.delete(`https://skillswap-backend-jxyu.onrender.com/api/resources/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-indigo-600">📚 Shared Resources</h1>

      {/* Upload */}
      <UploadResource onUploaded={load} />

      {/* Search */}
      <input
        className="input mb-6"
        placeholder="Search by title (e.g. javascript)"
        value={filter}
        onChange={(e) => setFilter(e.target.value.trim())}
      />

      {/* List */}
      {/* List */}
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {resources.map((r) => (
    <div key={r._id} className="bg-white shadow p-4 rounded">
      <h3 className="font-bold">{r.title}</h3>
      <p className="text-sm mb-2 text-gray-600">{r.description}</p>
      <p className="text-xs text-gray-400 mb-2">
  By {r.uploader?.name || "Unknown"} • {new Date(r.createdAt).toLocaleString()}
</p>

      <div className="space-x-2 mb-2">
        {r.fileUrl && (
            <a
          href={`${r.fileUrl}?fl_attachment=true`}
          className="text-green-600 underline"
          download
        >
          ⬇️ Download
        </a>
          
        )}
        
      </div>
      <div className="flex flex-wrap gap-1">
        {r.tags.map((t) => (
          <span key={t} className="text-xs bg-indigo-100 px-2 py-0.5 rounded">
            #{t}
          </span>
        ))}
      </div>
      {r.uploader && localStorage.getItem("userId") === r.uploader._id && (
        <button
          onClick={() => handleDelete(r._id)}
          className="text-red-600 text-sm mt-2 block"
        >
          🗑 Delete
        </button>
      )}
    </div>
  ))}
</div>

    </div>
  );
};

export default ResourcesPage;
