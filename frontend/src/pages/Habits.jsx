import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle2, Clock, Flame, X } from 'lucide-react';

const categories = ['saving', 'investing', 'budgeting', 'debt', 'learning', 'other'];
const colors = { saving: 'text-secondary', investing: 'text-blue-500', budgeting: 'text-purple-500', debt: 'text-red-500', learning: 'text-orange-500', other: 'text-gray-500' };
const bgColors = { saving: 'bg-secondary/10', investing: 'bg-blue-50', budgeting: 'bg-purple-50', debt: 'bg-red-50', learning: 'bg-orange-50', other: 'bg-gray-50' };

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'saving', frequency: 'daily', targetAmount: '' });

  const fetchHabits = async () => {
    try { const { data } = await api.get('/habits'); setHabits(data); }
    catch(_) { toast.error('Failed to load habits'); }
    setLoading(false);
  };
  useEffect(() => { fetchHabits(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/habits', form);
      setHabits([data, ...habits]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'saving', frequency: 'daily', targetAmount: '' });
      toast.success('Habit created!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCheck = async (id) => {
    try {
      const { data } = await api.patch(`/habits/${id}/check`);
      setHabits(prev => prev.map(h => h._id === id ? data : h));
      toast.success('Habit checked off! 🎉');
    } catch(_) { toast.error('Failed to check habit'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit deleted');
    } catch(_) { toast.error('Failed to delete'); }
  };

  const isCompletedToday = (habit) => {
    const today = new Date().setHours(0,0,0,0);
    return habit.completedDates?.some(d => new Date(d).setHours(0,0,0,0) === today);
  };

  const active = habits.filter(h => !isCompletedToday(h));
  const done = habits.filter(h => isCompletedToday(h));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Financial Habits" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-textSecondary text-sm">{done.length} of {habits.length} completed today</p>
            </div>
            <button id="add-habit-btn" onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={16} /> Add Habit
            </button>
          </div>

          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[['Total Habits', habits.length, 'bg-primary/10 text-primary'],
              ['Done Today', done.length, 'bg-secondary/10 text-secondary'],
              ['Best Streak', Math.max(...habits.map(h => h.longestStreak || 0), 0), 'bg-orange-100 text-orange-600'],
            ].map(([label, val, cls]) => (
              <div key={label} className="card-glass p-4 text-center">
                <p className={`text-2xl font-bold ${cls.split(' ')[1]}`}>{val}</p>
                <p className="text-xs text-textSecondary mt-1">{label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : habits.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <h3 className="text-lg font-medium text-textPrimary mb-1">No habits yet</h3>
              <p className="text-textSecondary text-sm">Create your first financial habit to start building wealth.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {active.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-3">Pending Today</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {active.map(habit => (
                      <div key={habit._id} className="card-glass card-hover p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${bgColors[habit.category]}`}>
                              <Clock size={18} className={colors[habit.category]} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-textPrimary truncate">{habit.title}</p>
                              <p className="text-xs text-textSecondary capitalize">{habit.category} · {habit.frequency}</p>
                              {habit.description && <p className="text-xs text-textSecondary mt-1 truncate">{habit.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleCheck(habit._id)} className="p-1.5 rounded-md text-textSecondary hover:text-secondary hover:bg-secondary/10 transition-colors" title="Mark complete">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(habit._id)} className="p-1.5 rounded-md text-textSecondary hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-1 text-orange-500">
                            <Flame size={14} />
                            <span className="text-xs font-medium">{habit.currentStreak} day streak</span>
                          </div>
                          <span className="text-xs text-textSecondary">Best: {habit.longestStreak} days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {done.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-3">Completed Today ✅</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {done.map(habit => (
                      <div key={habit._id} className="card-glass p-5 opacity-70 border-secondary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-secondary/10 flex items-center justify-center"><CheckCircle2 size={18} className="text-secondary" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-textPrimary truncate line-through">{habit.title}</p>
                            <p className="text-xs text-secondary font-medium">Completed · {habit.currentStreak} day streak 🔥</p>
                          </div>
                          <button onClick={() => handleDelete(habit._id)} className="p-1.5 rounded-md text-textSecondary hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-textPrimary">New Financial Habit</h3>
              <button onClick={() => setShowForm(false)} className="text-textSecondary hover:text-textPrimary"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Habit Title</label>
                <input id="habit-title" type="text" placeholder="e.g. Save $10 daily" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Description</label>
                <input type="text" placeholder="Optional description" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="input-field">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Target Amount ($)</label>
                <input type="number" placeholder="0.00" min="0" value={form.targetAmount}
                  onChange={e => setForm({...form, targetAmount: e.target.value})} className="input-field" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
                <button id="habit-submit" type="submit" className="btn-primary flex-1">Create Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
