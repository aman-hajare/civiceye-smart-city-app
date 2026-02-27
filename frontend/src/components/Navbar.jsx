import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { logout, getRole, getUserName, getFullName } from '../services/auth';

const Navbar = ({ onMenuToggle }) => {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const role = getRole();
  const userName = getUserName();
  const fullName = getFullName();
  const roleLabelByRole = {
    ADMIN: 'Administrator',
    WORKER: 'Worker',
    USER: 'User',
  };
  const displayRole = role || 'USER';
  const displayName = fullName || userName || roleLabelByRole[displayRole] || 'User';
  const headerByRole = {
    ADMIN: 'Admin Dashboard',
    WORKER: 'Worker Dashboard',
    USER: 'User Dashboard',
  };
  const headerTitle = headerByRole[role] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6 w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          ☰
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden md:block">{headerTitle}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-gray-600">{isConnected ? 'Live' : 'Offline'}</span>
        </div>

        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-blue-600 disabled:text-gray-400"
                >
                  Mark all read
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications</p>
              ) : (
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${notification.is_read ? 'bg-white' : 'bg-red-50'}`}
                    >
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-700"
          >
            <span>👤</span>
            <span className="uppercase tracking-wide">{displayRole}</span>
            <span className={`text-xs transition-transform ${showMenu ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500">{displayRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
