import { NavLink } from "react-router-dom";
import { Home, AlertCircle, Users, BarChart3 } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white fixed left-0 top-0 p-5">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">
        CivicEye
      </h1>

      <nav className="flex flex-col gap-4">
        <NavLink to="/dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <Home size={20} /> Dashboard
        </NavLink>


        <NavLink
        to="/issues"
        className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded ${
            isActive ? "bg-blue-600" : "hover:bg-gray-800"
            }`
        }
        >
        <AlertCircle size={20} /> Issues
        </NavLink>

        

        <NavLink to="/users" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <Users size={20} /> Users
        </NavLink>

        <NavLink to="/analytics" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <BarChart3 size={20} /> Analytics
        </NavLink>

        <NavLink to="/map">
          🗺️ Map View
        </NavLink>

        {role === "USER" && (
        <NavLink to="/report">Report Issue</NavLink>
           )}

        
      </nav>
    </div>
  );
};

export default Sidebar;
