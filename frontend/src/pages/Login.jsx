import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setAuthSession } from '../services/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const fetchUserRole = async (token, usernameValue) => {
    try {
      const response = await api.get('/users/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = getList(response.data);
      const currentUser = users.find(
        (user) => String(user?.username || '').toLowerCase() === String(usernameValue || '').toLowerCase()
      );
      return String(currentUser?.role || 'USER').toUpperCase();
    } catch {
      return 'USER';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/token/', { username, password });
      const { access, refresh } = response.data;

      if (!access) {
        throw new Error('No access token received');
      }

      const role = await fetchUserRole(access, username);
      setAuthSession({ access, refresh, role });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-center bg-cover bg-no-repeat relative"
      style={{ backgroundImage: "url('/black-white-smart-city-network-connections-black-white-smart-city-network-connections-communication-technology-102747131.webp')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/58 via-black/42 to-slate-900/58" />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/92 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-wide text-gray-900">CivicEye</h1>
            <p className="text-gray-700 mt-2 font-medium">Smart City Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input w-full px-4 py-2.5 border border-slate-300/70 rounded-xl bg-slate-100/55 text-gray-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full px-4 py-2.5 border border-slate-300/70 rounded-xl bg-slate-100/55 text-gray-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="p-3 bg-red-100/90 border border-red-400 text-red-800 rounded-xl text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-300/80 bg-white/45 rounded-xl px-4 py-3">
            <p className="text-center text-sm font-bold text-gray-900">Demo Credentials</p>
            <p className="text-center text-sm text-gray-800 mt-2">Admin: admin / password</p>
            <p className="text-center text-sm text-gray-800">Worker: worker / password</p>
            <p className="text-center text-sm text-gray-800">User: user / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
