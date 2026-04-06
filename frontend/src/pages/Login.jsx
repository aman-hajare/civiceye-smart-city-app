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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 28%), radial-gradient(circle at right center, rgba(148, 163, 184, 0.16), transparent 24%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%)',
      }}
    >
      <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-slate-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/88 backdrop-blur-xl border border-slate-700/70 rounded-3xl shadow-2xl shadow-black/35 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-cyan-400 text-slate-950 font-bold text-lg shadow-lg shadow-cyan-400/20">
              C
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-4">CivicEye</h1>
            <p className="text-slate-300 mt-2 font-medium">Smart City Management System</p>
            <p className="text-sm text-slate-400 mt-3 leading-6">
              Manage complaints, monitor issues, and keep city operations moving from a single dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 mb-6 p-1 rounded-2xl bg-slate-950/55 border border-slate-700/60">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'login'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'signup'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
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
                  className="login-input w-full px-4 py-2.5 border border-slate-700/80 rounded-xl bg-slate-950/35 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
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
                  className="login-input w-full px-4 py-2.5 border border-slate-700/80 rounded-xl bg-slate-950/35 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-sm">{error}</div>}
              {message && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 rounded-xl text-sm">{message}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-xl hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="login-input w-full px-4 py-2.5 border border-slate-700/80 rounded-xl bg-slate-950/35 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
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
                  className="login-input w-full px-4 py-2.5 border border-slate-700/80 rounded-xl bg-slate-950/35 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
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
                  className="login-input w-full px-4 py-2.5 border border-slate-700/80 rounded-xl bg-slate-950/35 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
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
                  className="login-input w-full px-4 py-2.5 border border-slate-700/80 rounded-xl bg-slate-950/35 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                  placeholder="Create a password"
                  minLength={8}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-slate-400 mt-1">Use at least 8 characters.</p>
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-sm">{error}</div>}
              {message && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 rounded-xl text-sm">{message}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-xl hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-sm text-slate-400">
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
            <div className="mt-6 pt-5 border-t border-slate-700/60 rounded-2xl px-4 py-4 bg-slate-950/30">
              <p className="text-center text-sm text-slate-200">Username / password</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
