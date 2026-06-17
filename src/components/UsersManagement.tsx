import { useState, useEffect } from 'react';
import { User, useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New user form state
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id, username, isAdmin, shopName');
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim() || !newPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');

    try {
      const { error } = await supabase.from('users').insert([{
        id: `user-${Date.now()}`,
        username: newUserId.trim(),
        password: newPassword,
        isAdmin
      }]);
      
      if (!error) {
        setNewUserId('');
        setNewPassword('');
        setIsAdmin(false);
        fetchUsers();
      } else {
        if (error.message.includes('unique constraint') || error.code === '23505') {
          setFormError('User ID already exists');
        } else {
          setFormError(error.message || 'Failed to create user');
        }
      }
    } catch (err) {
      setFormError('Failed to connect to Supabase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'ETZEL') {
      alert('Cannot delete the default admin account.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) {
        fetchUsers();
      } else {
        alert(error.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500">Loading users...</div>;
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/40 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">User Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add User Form */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Add New User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">User ID</label>
              <input
                type="text"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="e.g. staff1"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAdminCheck"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
              />
              <label htmlFor="isAdminCheck" className="text-sm text-slate-700 dark:text-slate-300">Grant Admin Privileges</label>
            </div>

            {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-sm"
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Current Users</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {users.length === 0 ? (
              <p className="text-sm text-slate-500">No users found.</p>
            ) : (
              users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.isAdmin ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{u.username}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{u.isAdmin ? 'Administrator' : 'Standard User'}</p>
                    </div>
                  </div>
                  {u.username !== 'ETZEL' && u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
