import { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { DollarSign, TrendingUp, Target, Zap, CheckCircle2, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import formatCurrency from '../utils/currency';

const spendingData = [
  { month: 'Jan', expenses: 2400, income: 4000 },
  { month: 'Feb', expenses: 1398, income: 3800 },
  { month: 'Mar', expenses: 2800, income: 4200 },
  { month: 'Apr', expenses: 1908, income: 4100 },
  { month: 'May', expenses: 2400, income: 4500 },
  { month: 'Jun', expenses: 1800, income: 4300 },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, h, g, e] = await Promise.all([
          api.get('/expenses/summary'),
          api.get('/habits'),
          api.get('/goals'),
          api.get('/expenses?limit=5'),
        ]);
        setSummary(s.data);
        setHabits(h.data.slice(0, 4));
        setGoals(g.data.slice(0, 3));
        setExpenses(e.data.expenses);
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const completedHabits = habits.filter(h => {
    const today = new Date().setHours(0,0,0,0);
    return h.completedDates?.some(d => new Date(d).setHours(0,0,0,0) === today);
  }).length;

  if (loading) return (
    <div className="flex h-screen"><Sidebar />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold">Good morning, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-blue-100 mt-1 text-sm">You have {habits.length - completedHabits} habits left to complete today.</p>
            <div className="mt-3 flex items-center gap-2">
              <ProgressBar value={completedHabits} max={Math.max(habits.length, 1)} />
              <span className="text-white text-xs font-medium whitespace-nowrap">{completedHabits}/{habits.length} done</span>
            </div>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Monthly Income" value={formatCurrency(summary?.totalIncome || 0, user?.currency)} icon={DollarSign} color="secondary" change={8} />
            <StatCard title="Monthly Expenses" value={formatCurrency(summary?.totalExpenses || 0, user?.currency)} icon={TrendingUp} color="red" change={-3} />
            <StatCard title="Net Balance" value={formatCurrency(summary?.balance || 0, user?.currency)} icon={Zap} color="primary" />
            <StatCard title="Active Goals" value={goals.length} icon={Target} color="purple" />
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-glass p-6">
              <h3 className="font-semibold text-textPrimary mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card-glass p-6">
              <h3 className="font-semibold text-textPrimary mb-4">Recent Transactions</h3>
              {expenses.length === 0 ? (
                <p className="text-textSecondary text-sm text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map(e => (
                    <div key={e._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-textPrimary capitalize">{e.title}</p>
                        <p className="text-xs text-textSecondary capitalize">{e.category}</p>
                      </div>
                      <span className={`text-sm font-semibold ${e.type === 'income' ? 'text-secondary' : 'text-red-500'}`}>
                        {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount, user?.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-textPrimary">Today's Habits</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{completedHabits}/{habits.length}</span>
              </div>
              {habits.length === 0 ? (
                <p className="text-textSecondary text-sm text-center py-8">No habits yet. <a href="/habits" className="text-primary underline">Create one</a></p>
              ) : (
                <div className="space-y-3">
                  {habits.map(h => {
                    const done = h.completedDates?.some(d => new Date(d).setHours(0,0,0,0) === new Date().setHours(0,0,0,0));
                    return (
                      <div key={h._id} className={`flex items-center gap-3 p-3 rounded-md border ${done ? 'border-secondary/30 bg-secondary/5' : 'border-border bg-surface-container'}`}>
                        {done ? <CheckCircle2 size={18} className="text-secondary shrink-0" /> : <Clock size={18} className="text-textSecondary shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-textPrimary truncate">{h.title}</p>
                          <p className="text-xs text-textSecondary">{h.currentStreak} day streak</p>
                        </div>
                        <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary">{h.category}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-textPrimary">Savings Goals</h3>
                <span className="text-xs text-textSecondary">{goals.filter(g => g.isCompleted).length}/{goals.length} completed</span>
              </div>
              {goals.length === 0 ? (
                <p className="text-textSecondary text-sm text-center py-8">No goals yet. <a href="/goals" className="text-primary underline">Add one</a></p>
              ) : (
                <div className="space-y-4">
                  {goals.map(g => (
                    <div key={g._id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-textPrimary">{g.title}</p>
                        <span className="text-xs font-medium text-primary">{g.progress}%</span>
                      </div>
                      <ProgressBar value={g.currentAmount} max={g.targetAmount} />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-textSecondary">{formatCurrency(g.currentAmount, user?.currency)}</span>
                        <span className="text-xs text-textSecondary">{formatCurrency(g.targetAmount, user?.currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
