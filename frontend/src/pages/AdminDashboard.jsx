import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { AlertCircle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_issues: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await api.get('dashboard/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard stats response:', response.data);

      setStats({
        total_issues: response.data?.total_issues || 0,
        pending: response.data?.pending || 0,
        in_progress: response.data?.in_progress || 0,
        resolved: response.data?.resolved || 0,
      });

      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to fetch statistics'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh every 15 seconds
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <DashboardLayout title="Admin Dashboard">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex gap-3 items-start">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm font-medium text-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !stats.total_issues ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh Now
            </button>
            {lastUpdated && (
              <span className="ml-4 text-sm text-gray-600 flex items-center">
                Last updated: {lastUpdated}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Issues"
              value={stats.total_issues || 0}
              icon={AlertCircle}
              color="blue"
              trend="+0%"
            />
            <StatCard
              title="Pending"
              value={stats.pending || 0}
              icon={Clock}
              color="yellow"
              trend={stats.pending > 0 ? 'Need attention' : 'All clear'}
            />
            <StatCard
              title="In Progress"
              value={stats.in_progress || 0}
              icon={TrendingUp}
              color="purple"
              trend="Active"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved || 0}
              icon={CheckCircle}
              color="green"
              trend="+0%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                System Overview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Resolution Rate</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.total_issues > 0
                        ? Math.round((stats.resolved / stats.total_issues) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.resolved} of {stats.total_issues} resolved
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Active Issues</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {(stats.pending || 0) + (stats.in_progress || 0)}
                  </span>
                </div>

                <div>
                  <p className="text-gray-600 font-medium mb-3">Completion Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.total_issues > 0
                            ? (stats.resolved / stats.total_issues) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Quick Status
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">TOTAL</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">
                    {stats.total_issues || 0}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                  <p className="text-xs text-yellow-600 font-bold uppercase tracking-wide">PENDING</p>
                  <p className="text-3xl font-bold text-yellow-700 mt-1">
                    {stats.pending || 0}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">IN PROGRESS</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">
                    {stats.in_progress || 0}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wide">RESOLVED</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {stats.resolved || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
