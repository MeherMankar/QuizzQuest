'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const fetchUsers = async (auth) => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setAuthenticated(true);
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      router.push('/admin');
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

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth) {
      fetchUsers(auth);
    } else {
      router.push('/admin');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">User Management System</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage user roles and permissions</p>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Current Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'teacher' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {user.role || 'student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.role !== 'teacher' && (
                            <button
                              onClick={() => updateRole(user.email, 'teacher')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              ↑ Promote to Teacher
                            </button>
                          )}
                          {user.role === 'teacher' && (
                            <button
                              onClick={() => updateRole(user.email, 'student')}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              ↓ Demote to Student
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-xs text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {users.filter(u => u.role === 'teacher').length}
              </div>
              <div className="text-xs text-gray-400">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {users.filter(u => u.role !== 'teacher').length}
              </div>
              <div className="text-xs text-gray-400">Students</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
