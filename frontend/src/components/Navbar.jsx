import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { logout, getRole } from '../services/auth';

const Navbar = ({ onMenuToggle }) => {
  const { unreadCount, isConnected } = useNotification();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const role = getRole();
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

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-gray-100 rounded-lg"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-700"
          >
            <span>👤</span>
            <span className="uppercase tracking-wide">{role}</span>
            <span className={`text-xs transition-transform ${showMenu ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 rounded-b-lg transition"
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
