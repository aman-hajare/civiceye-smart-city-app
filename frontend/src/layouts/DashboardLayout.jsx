import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useNotification } from "../context/NotificationContext";

const DashboardLayout = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, refreshNotifications, markAsRead } = useNotification();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center px-8 py-4 bg-white shadow">
          <Navbar />

          <div className="relative">
            <button onClick={() => setShowDropdown((prev) => !prev)} className="relative text-xl">
              ??
              {unreadCount > 0 ? (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              ) : null}
            </button>

            {showDropdown ? (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
                <h3 className="font-bold mb-2">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notifications</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <li
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-2 rounded cursor-pointer ${notif.is_read ? "bg-gray-100" : "bg-blue-100"}`}
                      >
                        <p className="text-sm">{notif.message || "Notification"}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
