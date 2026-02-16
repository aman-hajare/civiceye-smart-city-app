import { NavLink } from 'react-router-dom';
import { getRole } from '../services/auth';

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const role = getRole();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'WORKER', 'USER'] },
    { to: '/issues', label: 'Issues', icon: '📋', roles: ['ADMIN', 'WORKER', 'USER'] },
    { to: '/analytics', label: 'Analytics', icon: '📈', roles: ['ADMIN', 'WORKER'] },
    { to: '/map', label: 'Map View', icon: '🗺️', roles: ['ADMIN', 'WORKER', 'USER'] },
    { to: '/users', label: 'Users', icon: '👥', roles: ['ADMIN'] },
    { to: '/report', label: 'Report Issue', icon: '🆕', roles: ['USER'] },
  ].filter((item) => item.roles.includes(role));

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition md:hidden ${mobileOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onClose();
        }}
      />

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white px-4 py-6 transition-transform md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold text-blue-600">CivicEye</h1>
          <p className="mt-1 text-xs text-gray-500 uppercase tracking-wide">Smart City Management</p>
        </div>

        <nav className="space-y-1">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navClass}
              onClick={onClose}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
