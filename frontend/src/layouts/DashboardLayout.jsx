import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);



 useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  };

  fetchNotifications();

  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);

}, []);


  const markAsRead = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://127.0.0.1:8000/api/notifications/${id}/`,
      { is_read: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );
  } catch (error) {
    console.error("Mark read error:", error);
  }
};


  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64 bg-gray-100 min-h-screen">
        
        {/* Navbar + Notification */}
        <div className="flex justify-between items-center px-8 py-4 bg-white shadow">
          <Navbar />

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative text-xl"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
                <h3 className="font-bold mb-2">Notifications</h3>

                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No notifications
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <li
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-2 rounded cursor-pointer ${
                            notif.is_read
                              ? "bg-gray-100"
                              : "bg-blue-100"
                          }`}
                        >
                          <p className="text-sm">
                            {notif.message}
                          </p>
                        </li>

                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
