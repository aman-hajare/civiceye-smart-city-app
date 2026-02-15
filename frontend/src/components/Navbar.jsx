const Navbar = () => {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-8 ml-64">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">Welcome, Aman</span>
        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default Navbar;
