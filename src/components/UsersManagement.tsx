import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Trash2, UserPlus, Users } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  isAdmin: boolean;
}

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'http://localhost:3001/api';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim() || !newPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUserId.trim(),
          password: newPassword,
          isAdmin
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewUserId('');
        setNewPassword('');
        setIsAdmin(false);
        fetchUsers();
      } else {
        setFormError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setFormError('Failed to connect to local server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (id === 'admin-0' || username === 'ETZEL') {
      alert("Cannot delete the primary administrator.");
      return;
    }
    if (id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-indigo-400" />
          Add New User
        </h2>
        
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">User ID</label>
              <input
                type="text"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. STAFF_01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="isAdmin" className="text-slate-200 font-medium cursor-pointer flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Grant Admin Privileges
            </label>
          </div>

          {formError && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating User...' : 'Create Account'}
          </button>
        </form>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          Registered Users
        </h2>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="py-3 px-4 font-semibold">User ID</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{u.username}</td>
                    <td className="py-3 px-4">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                          <Users className="w-3 h-3" /> User
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== 'admin-0' && u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
