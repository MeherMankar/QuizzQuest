'use client';
import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      const res = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (res.ok) {
        setAuthenticated(true);
        localStorage.setItem('adminAuth', auth);
        fetchUsers(auth);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const fetchUsers = async (auth) => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Basic ${auth || localStorage.getItem('adminAuth')}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (email, newRole) => {
    try {
      const auth = localStorage.getItem('adminAuth');
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({ email, role: newRole })
      });

      if (res.ok) {
        fetchUsers(auth);
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth) {
      setAuthenticated(true);
      fetchUsers(auth);
    } else {
      setLoading(false);
    }
  }, []);

  if (!authenticated) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Username (Email)</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  placeholder="admin@hello.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  required
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-amber-400">Admin Panel - User Management</h1>
            <button
              onClick={() => {
                localStorage.removeItem('adminAuth');
                setAuthenticated(false);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
            >
              Logout
            </button>
          </div>

          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Current Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.role || 'student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.role !== 'teacher' && (
                            <button
                              onClick={() => updateRole(user.email, 'teacher')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg"
                            >
                              Promote to Teacher
                            </button>
                          )}
                          {user.role === 'teacher' && (
                            <button
                              onClick={() => updateRole(user.email, 'student')}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg"
                            >
                              Demote to Student
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
