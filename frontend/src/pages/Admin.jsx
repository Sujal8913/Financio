import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, Shield, Trash2, Crown } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [u, s] = await Promise.all([api.get('/admin/users'), api.get('/admin/stats')]);
      setUsers(u.data); setStats(s.data);
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to load admin data'); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === id ? data : u));
      toast.success('Role updated!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Admin Panel" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Administrators', value: stats.adminUsers, icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Regular Users', value: stats.regularUsers, icon: Shield, color: 'text-secondary', bg: 'bg-secondary/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card-glass p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${bg}`}><Icon size={20} className={color} /></div>
                  <div>
                    <p className="text-xs text-textSecondary">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          <div className="card-glass overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-textPrimary">All Users</h3>
              <span className="text-xs text-textSecondary bg-surface-container px-2 py-1 rounded-full">{users.length} total</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface-container">
                      {['User','Email','Role','Joined','Actions'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-textSecondary uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-surface-container transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-textPrimary">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-textSecondary">{u.email}</td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-sm text-textSecondary">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="p-1.5 text-textSecondary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
