import { useState, useEffect, useContext, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import formatCurrency from '../utils/currency';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, TrendingDown, TrendingUp, X, Paperclip } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORIES = ['food','transport','housing','entertainment','health','shopping','utilities','other'];
const CAT_COLORS = { food:'#f59e0b', transport:'#3b82f6', housing:'#8b5cf6', entertainment:'#ec4899', health:'#10b981', shopping:'#f97316', utilities:'#06b6d4', other:'#94a3b8' };

export default function Expenses() {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState({ category: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'food', type: 'expense', notes: '', date: new Date().toISOString().split('T')[0], receiptUrl: '' });
  const [loading, setLoading] = useState(true);
  const recFileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50, ...filter });
      const [e, s] = await Promise.all([api.get(`/expenses?${params}`), api.get('/expenses/summary')]);
      setExpenses(e.data.expenses);
      setSummary(s.data);
    } catch(_) { toast.error('Failed to load expenses'); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/expenses', { ...form, amount: parseFloat(form.amount) });
      setExpenses([data, ...expenses]);
      setShowForm(false);
      setForm({ title: '', amount: '', category: 'food', type: 'expense', notes: '', date: new Date().toISOString().split('T')[0], receiptUrl: '' });
      toast.success(`${form.type === 'income' ? 'Income' : 'Expense'} added!`);
      fetchData();
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/expenses/${id}`); setExpenses(prev => prev.filter(e => e._id !== id)); fetchData(); toast.success('Deleted'); }
    catch(_) { toast.error('Failed'); }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('File must be less than 5MB');
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, receiptUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const pieData = summary ? Object.entries(summary.byCategory || {}).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Expense Tracker" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Monthly Income', value: summary?.totalIncome || 0, icon: TrendingUp, cls: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Monthly Expenses', value: summary?.totalExpenses || 0, icon: TrendingDown, cls: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Net Balance', value: summary?.balance || 0, icon: summary?.balance >= 0 ? TrendingUp : TrendingDown, cls: summary?.balance >= 0 ? 'text-primary' : 'text-red-500', bg: 'bg-primary/10' },
            ].map(({ label, value, icon: Icon, cls, bg }) => (
              <div key={label} className="card-glass p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${bg}`}><Icon size={20} className={cls} /></div>
                <div>
                  <p className="text-xs text-textSecondary">{label}</p>
                  <p className={`text-xl font-bold ${cls}`}>{formatCurrency(Math.abs(value), user?.currency)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              <select value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})} className="input-field !w-auto text-sm">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="input-field !w-auto text-sm">
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <button id="add-expense-btn" onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={16} /> Add Transaction
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-glass">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-textPrimary">Transactions ({expenses.length})</h3>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : expenses.length === 0 ? (
                <p className="text-center text-textSecondary py-12 text-sm">No transactions found</p>
              ) : (
                <div className="divide-y divide-border">
                  {expenses.map(e => (
                    <div key={e._id} className="flex items-center gap-4 p-4 hover:bg-surface-container transition-colors">
                      <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: `${CAT_COLORS[e.category]}20` }}>
                        <span className="text-sm">{e.type === 'income' ? '💰' : '💸'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-textPrimary truncate capitalize">{e.title}</p>
                        <p className="text-xs text-textSecondary capitalize">{e.category} · {new Date(e.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {e.receiptUrl && (
                          <button onClick={() => {
                            const newTab = window.open();
                            if (newTab) {
                              newTab.document.body.innerHTML = `<iframe src="${e.receiptUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`;
                            }
                          }} className="text-secondary hover:bg-secondary/10 p-1 rounded transition-colors" title="View Attachment">
                            <Paperclip size={15} />
                          </button>
                        )}
                        <span className={`text-sm font-semibold mx-2 ${e.type === 'income' ? 'text-secondary' : 'text-red-500'}`}>
                          {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount, user?.currency)}
                        </span>
                        <button onClick={() => handleDelete(e._id)} className="text-textSecondary hover:text-red-500 p-1 rounded transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-glass p-5">
              <h3 className="font-semibold text-textPrimary mb-4">By Category</h3>
              {pieData.length === 0 ? (
                <p className="text-center text-textSecondary text-sm py-8">No expense data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} />
                    <Legend iconSize={10} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-textPrimary">Add Transaction</h3>
              <button onClick={() => setShowForm(false)} className="text-textSecondary hover:text-textPrimary"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-md">
                {['expense','income'].map(t => (
                  <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                    className={`py-2 rounded-md text-sm font-medium capitalize transition-all ${form.type === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-secondary text-white') : 'text-textSecondary hover:bg-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Title</label>
                <input id="exp-title" type="text" placeholder="e.g. Grocery shopping" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Amount ({user?.currency || 'USD'})</label>
                  <input id="exp-amount" type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Notes (optional)</label>
                <input type="text" placeholder="Additional notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  {form.type === 'expense' ? 'Add Bill (optional)' : 'Add Salary Slip (optional)'}
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => recFileInputRef.current?.click()} className="btn-outline flex-1 py-1 text-sm border-dashed">
                    <Paperclip size={14} className={form.receiptUrl ? 'text-primary' : ''} /> {form.receiptUrl ? 'Attachment Added' : 'Upload File'}
                  </button>
                  {form.receiptUrl && (
                    <button type="button" onClick={() => setForm({...form, receiptUrl: ''})} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-sm font-medium">
                      Remove
                    </button>
                  )}
                </div>
                <input type="file" accept="image/*,.pdf" ref={recFileInputRef} onChange={handleReceiptChange} className="hidden" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
                <button id="exp-submit" type="submit" className={`flex-1 ${form.type === 'income' ? 'btn-secondary' : 'btn-primary'}`}>Add {form.type === 'income' ? 'Income' : 'Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
