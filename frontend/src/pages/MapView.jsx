import { useEffect, useState } from 'react';
import { issueService } from '../services/issueService';

const MapView = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await issueService.getAll();
        setIssues(data || []);
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const issuesWithLocation = issues.filter(i => i.latitude && i.longitude);

  const statusColors = {
    PENDING: { bg: 'bg-red-100', text: 'text-red-800', marker: '🔴' },
    IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-800', marker: '🟡' },
    RESOLVED: { bg: 'bg-green-100', text: 'text-green-800', marker: '🟢' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
          <p className="text-gray-600 mt-2">Visual representation of reported issues by location</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔴</span>
                  <span className="text-sm text-gray-700">Pending Issues</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟡</span>
                  <span className="text-sm text-gray-700">In Progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟢</span>
                  <span className="text-sm text-gray-700">Resolved</span>
                </div>
              </div>

              <hr className="my-6" />

              <h3 className="text-lg font-bold text-gray-900 mb-4">Issues in Zone</h3>
              {selectedIssue ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{selectedIssue.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{selectedIssue.description}</p>
                  <div className="mt-3 flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[selectedIssue.status]?.bg}`}>
                      {selectedIssue.status}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {selectedIssue.category}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select an issue to view details</p>
              )}

              <hr className="my-6" />

              <p className="text-xs text-gray-600">
                Total Issues: <span className="font-bold">{issuesWithLocation.length}</span>
              </p>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 h-96 md:h-screen md:sticky md:top-6">
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg relative overflow-hidden">
                {/* Simplified map representation */}
                <div className="absolute inset-0 p-4">
                  <svg width="100%" height="100%" className="text-gray-300" opacity="0.3">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Issue markers */}
                  <div className="absolute inset-0 p-4">
                    {issuesWithLocation.map((issue, idx) => {
                      const x = Math.random() * 85 + 7.5;
                      const y = Math.random() * 85 + 7.5;
                      const statusColor = statusColors[issue.status];
                      return (
                        <button
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className="absolute text-2xl hover:scale-125 transition-transform cursor-pointer"
                          style={{ left: `${x}%`, top: `${y}%` }}
                          title={issue.title}
                        >
                          {statusColor?.marker || '🟣'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {issuesWithLocation.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">No issues with location data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">All Issues with Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issuesWithLocation.map(issue => {
              const statusColor = statusColors[issue.status];
              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedIssue?.id === issue.id
                      ? 'border-blue-500 bg-blue-50'
                      : `border-gray-200 bg-white hover:border-gray-300`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{issue.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {issue.location_name || `${issue.latitude}, ${issue.longitude}`}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{issue.description}</p>
                    </div>
                    <span className="text-2xl ml-2">{statusColor?.marker}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor?.bg}`}>
                      {issue.status}
                    </span>
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {issue.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
