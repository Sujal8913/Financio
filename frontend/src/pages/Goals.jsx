import { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import AuthContext from '../context/AuthContext';
import formatCurrency from '../utils/currency';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Target, X, PlusCircle } from 'lucide-react';

const GOAL_CATEGORIES = ['emergency','vacation','car','house','education','retirement','other'];
const CAT_EMOJI = { emergency:'🆘', vacation:'✈️', car:'🚗', house:'🏠', education:'📚', retirement:'👴', other:'🎯' };
const CAT_COLORS = { emergency:'bg-red-50 text-red-600', vacation:'bg-blue-50 text-blue-600', car:'bg-gray-100 text-gray-600', house:'bg-amber-50 text-amber-600', education:'bg-purple-50 text-purple-600', retirement:'bg-green-50 text-green-600', other:'bg-primary/10 text-primary' };

export default function Goals() {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showFund, setShowFund] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '', category: 'emergency', deadline: '' });

  const fetchGoals = async () => {
    try { const { data } = await api.get('/goals'); setGoals(data); }
    catch(_) { toast.error('Failed to load goals'); }
    setLoading(false);
  };
  useEffect(() => { fetchGoals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/goals', { ...form, targetAmount: parseFloat(form.targetAmount) });
      setGoals([data, ...goals]);
      setShowCreate(false);
      setForm({ title: '', description: '', targetAmount: '', category: 'emergency', deadline: '' });
      toast.success('Goal created!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleFund = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.patch(`/goals/${showFund}`, { addAmount: parseFloat(fundAmount) });
      setGoals(prev => prev.map(g => g._id === showFund ? data : g));
      setShowFund(null); setFundAmount('');
      toast.success('Funds added! 💰');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); setGoals(prev => prev.filter(g => g._id !== id)); toast.success('Goal deleted'); }
    catch(_) { toast.error('Failed'); }
  };

  const active = goals.filter(g => !g.isCompleted);
  const completed = goals.filter(g => g.isCompleted);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Savings Goals" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['Total Goals', goals.length, 'text-primary'],['Total Saved', formatCurrency(totalSaved, user?.currency), 'text-secondary'],['Completed', completed.length, 'text-purple-600']].map(([l,v,c]) => (
              <div key={l} className="card-glass p-5 text-center">
                <p className={`text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-textSecondary mt-1">{l}</p>
              </div>
            ))}
          </div>
          {totalTarget > 0 && (
            <div className="card-glass p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-textPrimary">Overall Progress</span>
                <span className="text-sm font-semibold text-primary">{Math.round((totalSaved / totalTarget) * 100)}%</span>
              </div>
              <ProgressBar value={totalSaved} max={totalTarget} />
              <p className="text-xs text-textSecondary mt-1">{formatCurrency(totalSaved, user?.currency)} of {formatCurrency(totalTarget, user?.currency)} saved</p>
            </div>
          )}

          <div className="flex justify-end">
            <button id="add-goal-btn" onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Goal</button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : goals.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <h3 className="text-lg font-medium text-textPrimary mb-1">No goals yet</h3>
              <p className="text-textSecondary text-sm">Create your first savings goal and start building wealth.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {active.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-3">Active Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {active.map(goal => (
                      <div key={goal._id} className="card-glass card-hover p-5">
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${CAT_COLORS[goal.category]}`}>
                              {CAT_EMOJI[goal.category]}
                            </div>
                            <div>
                              <h4 className="font-semibold text-textPrimary">{goal.title}</h4>
                              <p className="text-xs text-textSecondary capitalize">{goal.category}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(goal._id)} className="text-textSecondary hover:text-red-500 p-1 rounded transition-colors shrink-0">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-textSecondary">Progress</span>
                            <span className="font-medium text-primary">{goal.progress}%</span>
                          </div>
                          <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                          <div className="flex justify-between text-xs text-textSecondary">
                            <span>{formatCurrency(goal.currentAmount, user?.currency)} saved</span>
                            <span>{formatCurrency(goal.targetAmount, user?.currency)} goal</span>
                          </div>
                        </div>
                        {goal.deadline && (
                          <p className="text-xs text-textSecondary mb-3">📅 Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                        )}
                        <button onClick={() => setShowFund(goal._id)} className="w-full btn-secondary text-sm py-2">
                          <PlusCircle size={15} /> Add Funds
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-3">Completed Goals 🎉</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {completed.map(goal => (
                      <div key={goal._id} className="card-glass p-5 opacity-80 border-secondary/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl">{CAT_EMOJI[goal.category]}</div>
                          <div>
                            <h4 className="font-semibold text-textPrimary">{goal.title}</h4>
                            <p className="text-xs text-secondary font-medium">✅ Completed!</p>
                          </div>
                        </div>
                        <p className="text-sm text-textSecondary">{formatCurrency(goal.targetAmount, user?.currency)} reached</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-textPrimary">New Savings Goal</h3>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-textSecondary" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Goal Title</label>
                <input id="goal-title" type="text" placeholder="e.g. Emergency Fund" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Target Amount ({user?.currency || 'USD'})</label>
                  <input id="goal-target" type="number" min="1" step="0.01" placeholder="5000" value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Target Date (optional)</label>
                <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Description (optional)</label>
                <input type="text" placeholder="Brief description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">Cancel</button>
                <button id="goal-submit" type="submit" className="btn-primary flex-1">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showFund && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-textPrimary">Add Funds</h3>
              <button onClick={() => { setShowFund(null); setFundAmount(''); }}><X size={20} className="text-textSecondary" /></button>
            </div>
            <form onSubmit={handleFund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Amount to Add ({user?.currency || 'USD'})</label>
                <input id="fund-amount" type="number" min="1" step="0.01" placeholder="Enter amount" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="input-field" required autoFocus />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowFund(null); setFundAmount(''); }} className="btn-outline flex-1">Cancel</button>
                <button id="fund-submit" type="submit" className="btn-secondary flex-1">Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
