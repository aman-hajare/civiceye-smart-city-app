import { useEffect, useState } from 'react';
import { userService } from '../services/issueService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await userService.getAll();
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredUsers = filter
    ? users.filter(u => u.role === filter)
    : users;

  const roleSerialMap = (() => {
    const counters = { ADMIN: 0, WORKER: 0, USER: 0 };
    const map = {};

    filteredUsers.forEach((user) => {
      const role = user.role || 'USER';
      counters[role] = (counters[role] || 0) + 1;
      map[user.id] = counters[role];
    });

    return map;
  })();

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800',
    WORKER: 'bg-blue-100 text-blue-800',
    USER: 'bg-green-100 text-green-800',
  };

  const roleIcons = {
    ADMIN: '👨‍💼',
    WORKER: '👷',
    USER: '👤',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">View and manage system users</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setFilter('ADMIN')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'ADMIN'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admins ({users.filter(u => u.role === 'ADMIN').length})
              </button>
              <button
                onClick={() => setFilter('WORKER')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'WORKER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Workers ({users.filter(u => u.role === 'WORKER').length})
              </button>
              <button
                onClick={() => setFilter('USER')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'USER'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Citizens ({users.filter(u => u.role === 'USER').length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">S.No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => {
                    const roleColor = roleColors[user.role] || 'bg-gray-100 text-gray-800';
                    const roleIcon = roleIcons[user.role] || '👤';
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{roleIcon}</span>
                            <div>
                              <p className="font-medium text-gray-900">{user.username || user.name || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {roleSerialMap[user.id] || 1}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
