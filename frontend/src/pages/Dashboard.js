import { useEffect, useState } from 'react';
import { getRole } from '../services/auth';
import { issueService } from '../services/issueService';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const role = getRole();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [updatingIssueId, setUpdatingIssueId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (role === 'ADMIN') {
          const data = await issueService.getStats();
          setStats(data);
        } else if (role === 'WORKER') {
          const issues = await issueService.getAll();
          setAssignedIssues(issues);
        } else if (role === 'USER') {
          const issues = await issueService.getAll();
          setMyIssues(issues);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [role]);

  const updateWorkerIssueStatus = async (issueId, nextStatus) => {
    try {
      setUpdatingIssueId(issueId);
      await issueService.updateStatus(issueId, nextStatus);
      setAssignedIssues((prev) =>
        prev.map((item) => (item.id === issueId ? { ...item, status: nextStatus } : item))
      );
    } catch (error) {
      console.error('Failed to update worker issue status:', error);
    } finally {
      setUpdatingIssueId(null);
    }
  };

  const requestResolveFromAdmin = async (issueId) => {
    try {
      setUpdatingIssueId(issueId);
      await issueService.requestResolve(issueId);
    } catch (error) {
      console.error('Failed to request resolve from admin:', error);
    } finally {
      setUpdatingIssueId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of all reporting system metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Issues" value={stats.total || 0} color="bg-blue-500" icon="📊" />
            <StatCard title="Pending" value={stats.pending || 0} color="bg-yellow-500" icon="⏳" />
            <StatCard title="In Progress" value={stats.in_progress || 0} color="bg-orange-500" icon="🔄" />
            <StatCard title="Resolved" value={stats.resolved || 0} color="bg-green-500" icon="✓" />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Average Response Time</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">2.4h</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Active Workers</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'WORKER') {
    const pendingCount = assignedIssues.filter((i) => i.status === 'PENDING').length;
    const inProgressCount = assignedIssues.filter((i) => i.status === 'IN_PROGRESS').length;
    const resolvedCount = assignedIssues.filter((i) => i.status === 'RESOLVED').length;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="text-gray-600 mt-2">Your assigned tasks and progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Assigned Issues" value={assignedIssues.length} color="bg-blue-500" icon="📋" />
            <StatCard title="In Progress" value={inProgressCount} color="bg-orange-500" icon="🔄" />
            <StatCard title="Pending" value={pendingCount} color="bg-yellow-500" icon="⏳" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Resolved" value={resolvedCount} color="bg-emerald-500" icon="✓" />
            <StatCard title="Open Work" value={pendingCount + inProgressCount} color="bg-amber-500" icon="🛠️" />
            <StatCard
              title="Completion Rate"
              value={`${assignedIssues.length ? Math.round((resolvedCount / assignedIssues.length) * 100) : 0}%`}
              color="bg-indigo-500"
              icon="📈"
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Assigned Tasks</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {assignedIssues.length > 0 ? (
                assignedIssues.slice(0, 10).map((issue) => (
                  <div key={issue.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{issue.description?.substring(0, 120)}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {issue.category}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            issue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            issue.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {issue.status === 'PENDING' && (
                          <button
                            onClick={() => updateWorkerIssueStatus(issue.id, 'IN_PROGRESS')}
                            disabled={updatingIssueId === issue.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            Start Work
                          </button>
                        )}
                        {issue.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => requestResolveFromAdmin(issue.id)}
                            disabled={updatingIssueId === issue.id}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                          >
                            Request Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No assigned tasks</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Your reported issues and their status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Reported Issues" value={myIssues.length} color="bg-blue-500" icon="📋" />
          <StatCard title="Resolved" value={myIssues.filter((i) => i.status === 'RESOLVED').length} color="bg-green-500" icon="✓" />
          <StatCard title="Pending" value={myIssues.filter((i) => i.status === 'PENDING').length} color="bg-yellow-500" icon="⏳" />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Issues</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {myIssues.length > 0 ? (
              myIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{issue.description?.substring(0, 100)}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {issue.category}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          issue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          issue.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No issues reported</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
