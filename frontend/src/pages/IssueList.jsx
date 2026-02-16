import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Trash2, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import { getRole } from '../services/auth';

const IssueList = () => {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [assigningIssueId, setAssigningIssueId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const role = getRole();

  const getIssuesList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const getWorkersList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/issues/');
      setIssues(getIssuesList(res.data));
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [fetchIssues]);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (role !== 'ADMIN') return;
      try {
        const res = await api.get('/users/', { params: { role: 'WORKER' } });
        setWorkers(getWorkersList(res.data));
      } catch (err) {
        console.error('Failed to load workers:', err);
      }
    };

    fetchWorkers();
  }, [role]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/${issueId}/`, { status: newStatus });
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (issueId) => {
    if (role !== 'ADMIN') return;
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await api.delete(`/issues/${issueId}/`);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
    } catch (err) {
      alert('Failed to delete issue: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAssignWorker = async (issueId, workerId) => {
    if (role !== 'ADMIN') return;
    try {
      setAssigningIssueId(issueId);
      const payload = { assigned_to_id: workerId || null };
      const res = await api.patch(`/issues/${issueId}/`, payload);
      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? { ...issue, ...res.data } : issue))
      );
    } catch (err) {
      alert('Failed to assign worker: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAssigningIssueId(null);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex gap-3 items-start">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={fetchIssues}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        </button>
        {lastUpdated && <span className="text-sm text-gray-600 flex items-center">Last updated: {lastUpdated}</span>}
      </div>

      {loading && issues.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading issues...</p>
          </div>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No issues found</p>
          <p className="text-gray-400 text-sm mt-1">Issues will appear here once they are reported</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned Worker</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                  {role === 'ADMIN' && <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{issue.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{issue.category}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {issue.image_url || issue.image ? (
                        <a href={issue.image_url || issue.image} target="_blank" rel="noreferrer">
                          <img
                            src={issue.image_url || issue.image}
                            alt={issue.title}
                            className="h-12 w-16 object-cover rounded border border-gray-200"
                          />
                        </a>
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === issue.id && role === 'ADMIN' ? (
                        <div className="flex gap-2 items-center">
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                          <button onClick={() => handleStatusChange(issue.id, editStatus)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-medium">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400 font-medium">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{issue.status}</span>
                          {role === 'ADMIN' && (
                            <button onClick={() => { setEditingId(issue.id); setEditStatus(issue.status); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 rounded transition-colors">
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {role === 'ADMIN' ? (
                        <select
                          value={issue.assigned_to?.id || ''}
                          onChange={(e) => handleAssignWorker(issue.id, e.target.value)}
                          disabled={assigningIssueId === issue.id}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="">Unassigned</option>
                          {workers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                              {worker.username}
                            </option>
                          ))}
                        </select>
                      ) : (
                        issue.assigned_to?.username || 'Unassigned'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'N/A'}</td>
                    {role === 'ADMIN' && (
                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => handleDelete(issue.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors" title="Delete issue">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default IssueList;
