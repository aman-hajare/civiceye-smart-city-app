import { useEffect, useState } from 'react';
import { issueService } from '../services/issueService';

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, issuesData] = await Promise.all([
          issueService.getStats(),
          issueService.getAll(),
        ]);
        setStats(statsData);
        setIssues(issuesData || []);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categoryCount = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const statusCount = {
    PENDING: stats.pending || 0,
    IN_PROGRESS: stats.in_progress || 0,
    RESOLVED: stats.resolved || 0,
  };

  const totalIssues = stats.total || issues.length;
  const resolutionRate = totalIssues > 0 ? Math.round((stats.resolved / totalIssues) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Insights into issue reporting and resolution</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 uppercase">Total Issues</h3>
            <p className="text-4xl font-bold text-blue-600 mt-4">{totalIssues}</p>
            <p className="text-xs text-gray-500 mt-2">System-wide reporting</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 uppercase">Resolution Rate</h3>
            <p className="text-4xl font-bold text-green-600 mt-4">{resolutionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">{stats.resolved || 0} resolved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 uppercase">Avg. Resolution Time</h3>
            <p className="text-4xl font-bold text-orange-600 mt-4">2.4h</p>
            <p className="text-xs text-gray-500 mt-2">Average per issue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Issues by Status</h3>
            <div className="space-y-4">
              {Object.entries(statusCount).map(([status, count]) => {
                const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
                const colors = {
                  PENDING: 'bg-yellow-500',
                  IN_PROGRESS: 'bg-orange-500',
                  RESOLVED: 'bg-green-500',
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{status}</span>
                      <span className="text-sm font-bold text-gray-900">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${colors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Issues by Category</h3>
            <div className="space-y-3">
              {Object.entries(categoryCount)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => {
                  const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{category}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{count} issues</span>
                        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {issues.slice(0, 5).map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-900">{issue.title}</p>
                  <p className="text-sm text-gray-600">{new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  issue.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
