import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setAuthSession } from '../services/auth';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const getErrorMessage = (err, fallbackMessage) => {
    const payload = err?.response?.data;

    if (typeof payload?.detail === 'string') {
      return payload.detail;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const firstKey = Object.keys(payload)[0];
      const value = payload[firstKey];
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      if (typeof value === 'string') {
        return value;
      }
    }

    return fallbackMessage;
  };

  const switchMode = (nextMode) => {
    if (loading) return;
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  const fetchUserProfile = async (token, usernameValue) => {
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
      return {
        role: String(currentUser?.role || 'USER').toUpperCase(),
        fullName: String(currentUser?.full_name || currentUser?.username || usernameValue || '').trim(),
      };
    } catch {
      return {
        role: 'USER',
        fullName: String(usernameValue || '').trim(),
      };
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const cleanIdentifier = identifier.trim().toLowerCase();
      const response = await api.post('/token/', { username: cleanIdentifier, password });
      const { access, refresh } = response.data;

      if (!access) {
        throw new Error('No access token received');
      }

      const { role, fullName } = await fetchUserProfile(access, cleanIdentifier);
      setAuthSession({ access, refresh, role, username: cleanIdentifier, fullName });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const cleanFirstName = firstName.trim();
      const cleanLastName = lastName.trim();
      const cleanEmail = email.trim().toLowerCase();

      await api.post('/register/', {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        password: signupPassword,
      });

      setMode('login');
      setIdentifier(cleanFirstName.toLowerCase());
      setPassword('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setSignupPassword('');
      setMessage('Account created successfully. Please login with first name and password.');
    } catch (err) {
      setError(getErrorMessage(err, 'Account creation failed. Please try again.'));
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

          <div className="grid grid-cols-2 gap-1 mb-6 p-1 rounded-xl bg-slate-200/70">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'login'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'signup'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Username</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
              {message && <div className="p-3 bg-emerald-100/90 border border-emerald-500 text-emerald-800 rounded-xl text-sm">{message}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="login-input w-full px-4 py-2.5 border border-slate-300/70 rounded-xl bg-slate-100/55 text-gray-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="Enter your first name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="login-input w-full px-4 py-2.5 border border-slate-300/70 rounded-xl bg-slate-100/55 text-gray-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="Enter your last name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input w-full px-4 py-2.5 border border-slate-300/70 rounded-xl bg-slate-100/55 text-gray-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="login-input w-full px-4 py-2.5 border border-slate-300/70 rounded-xl bg-slate-100/55 text-gray-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="Create a password"
                  minLength={8}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-slate-600 mt-1">Use at least 8 characters.</p>
              </div>

              {error && <div className="p-3 bg-red-100/90 border border-red-400 text-red-800 rounded-xl text-sm">{error}</div>}
              {message && <div className="p-3 bg-emerald-100/90 border border-emerald-500 text-emerald-800 rounded-xl text-sm">{message}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-sm text-slate-700">
            {mode === 'login' ? (
              <>
                New user?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-semibold text-cyan-700 hover:underline"
                  disabled={loading}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-cyan-700 hover:underline"
                  disabled={loading}
                >
                  Login
                </button>
              </>
            )}
          </div>

          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-gray-300/80 bg-white/45 rounded-xl px-4 py-3">
              <p className="text-center text-sm font-bold text-gray-900">Demo Credentials</p>
              <p className="text-center text-sm text-gray-800 mt-2">Admin: admin / password</p>
              <p className="text-center text-sm text-gray-800">Worker: worker / password</p>
              <p className="text-center text-sm text-gray-800">User: user / password</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
