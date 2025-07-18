import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bell } from "lucide-react";          // npm install lucide-react
import { Link } from "react-router-dom";

const API_BASE = "https://skillswap-backend-jxyu.onrender.com";     

const NotificationBell = () => {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen]   = useState(false);
  const token = localStorage.getItem("token");
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(data);
    } catch {
      console.error("Failed to load notifications");
    }
  };

  // initial + 30‑sec polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // delete helper
  const deleteNotif = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs((prev) => prev.filter((n) => n._id !== id));
    } catch {
      console.error("Delete failed");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}>
        <Bell className="w-6 h-6 text-yellow-400" />
        {notifs.length > 0 && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50 max-h-96 overflow-y-auto">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifs.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications</p>
          ) : (
            notifs.map((n) => (
              <div
                key={n._id}
                className="bg-gray-100 rounded p-2 mb-2 flex justify-between gap-2"
              >
                <div className="text-sm">
                  {n.link ? (
                    <Link to={n.link} onClick={() => setOpen(false)} className="text-indigo-600 underline">
                      {n.text}
                    </Link>
                  ) : (
                    n.text
                  )}
                </div>
                <button
                  onClick={() => deleteNotif(n._id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
