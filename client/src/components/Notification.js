import React, { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("https://skillswap-backend-jxyu.onrender.com//api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="w-full flex justify-center mt-6 px-4">
      <div className="bg-white p-4 rounded shadow max-w-md w-full">
        <h3 className="text-lg font-bold mb-3">🔔 Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n._id} className="bg-gray-100 p-2 rounded">
                {n.link ? (
                  <a href={n.link} className="text-indigo-600 underline">
                    {n.text}
                  </a>
                ) : (
                  n.text
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
