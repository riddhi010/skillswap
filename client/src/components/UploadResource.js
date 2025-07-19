import React, { useState } from "react";
import axios from "axios";
import { FiUpload, FiPlus, FiX } from "react-icons/fi";

const UploadResource = ({ onUploaded }) => {
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("file", file);

    await axios.post("https://skillswap-backend-jxyu.onrender.com/api/resources", fd, {
      headers: { Authorization: `Bearer ${token}` },
    });

    onUploaded();
    setForm({ title: "", description: "", tags: "" });
    setFile(null);
    setShowForm(false);
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 border border-indigo-500 text-indigo-600 rounded hover:bg-indigo-50 transition"
        >
          <FiPlus className="text-lg" />
          <span>Upload Resource</span>
        </button>
      ) : (
        <>
          {/* Upload Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200 relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <FiX size={18} />
            </button>

            <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
              <FiUpload /> Upload New Resource
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Enter title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Write a brief description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="e.g. javascript, react"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input
                type="file"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:rounded-md file:border-gray-300 file:bg-gray-50 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Upload Resource
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default UploadResource;
