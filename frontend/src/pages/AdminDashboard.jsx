import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
  total_issues: 0,
  pending_issues: 0,
  resolved_issues: 0,
  in_progress_issues: 0,   
  active_workers: 0,
});


  const chartData = [
    { name: "Pending", value: stats.pending_issues },
    { name: "In Progress", value: stats.in_progress_issues },
    { name: "Resolved", value: stats.resolved_issues },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data);

      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
    <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

    {/* Cards */}
    <div className="grid grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">Total Issues</h3>
        <p className="text-2xl font-bold mt-2">
          {stats.total_issues}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">Pending</h3>
        <p className="text-2xl font-bold mt-2 text-red-500">
          {stats.pending_issues}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">In Progress</h3>
        <p className="text-2xl font-bold mt-2 text-yellow-500">
          {stats.in_progress_issues}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">Resolved</h3>
        <p className="text-2xl font-bold mt-2 text-green-500">
          {stats.resolved_issues}
        </p>
      </div>
    </div>

    {/* Pie Chart */}
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">
        Issue Distribution
      </h2>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              <Cell fill="#ef4444" />
              <Cell fill="#facc15" />
              <Cell fill="#22c55e" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </DashboardLayout>
  );
};

export default AdminDashboard;
