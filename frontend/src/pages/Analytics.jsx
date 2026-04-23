import { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import formatCurrency from '../utils/currency';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899','#06b6d4','#f97316','#94a3b8'];

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/expenses/summary').then(({ data }) => setSummary(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const trendData = [
    { month: 'Oct', saving: 320, spending: 1800 },
    { month: 'Nov', saving: 580, spending: 2100 },
    { month: 'Dec', saving: 400, spending: 2400 },
    { month: 'Jan', saving: 720, spending: 1900 },
    { month: 'Feb', saving: 890, spending: 1700 },
    { month: 'Mar', saving: 1100, spending: 1600 },
  ];

  const weekData = [
    { day: 'Mon', amount: 45 }, { day: 'Tue', amount: 120 }, { day: 'Wed', amount: 30 },
    { day: 'Thu', amount: 85 }, { day: 'Fri', amount: 210 }, { day: 'Sat', amount: 150 }, { day: 'Sun', amount: 60 },
  ];

  const pieData = summary?.byCategory
    ? Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }))
    : [{ name: 'No data', value: 1 }];

  const stats = [
    { label: 'Avg Daily Spend', value: formatCurrency(42, user?.currency), change: '-8%', positive: true },
    { label: 'Savings Rate', value: '22%', change: '+3%', positive: true },
    { label: 'Largest Expense', value: 'Housing', change: '34% of total', positive: null },
    { label: 'Monthly Trend', value: '↑ Improving', change: 'vs last month', positive: true },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Wealth Analytics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="card-glass p-4">
                <p className="text-xs text-textSecondary mb-1">{s.label}</p>
                <p className="text-xl font-bold text-textPrimary">{s.value}</p>
                <span className={`text-xs font-medium ${s.positive === true ? 'text-secondary' : s.positive === false ? 'text-red-500' : 'text-textSecondary'}`}>{s.change}</span>
              </div>
            ))}
          </div>

          
          <div className="card-glass p-6">
            <h3 className="font-semibold text-textPrimary mb-1">Savings vs Spending Trend</h3>
            <p className="text-xs text-textSecondary mb-4">Last 6 months overview</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => formatCurrency(v, user?.currency)} />
                <Area type="monotone" dataKey="saving" stroke="#10b981" strokeWidth={2} fill="url(#saveGrad)" name="Savings" />
                <Area type="monotone" dataKey="spending" stroke="#3b82f6" strokeWidth={2} fill="url(#spendGrad)" name="Spending" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="card-glass p-6">
              <h3 className="font-semibold text-textPrimary mb-1">Daily Spending This Week</h3>
              <p className="text-xs text-textSecondary mb-4">Daily breakdown</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            
            <div className="card-glass p-6">
              <h3 className="font-semibold text-textPrimary mb-1">Expense Breakdown</h3>
              <p className="text-xs text-textSecondary mb-4">This month by category</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} />
                  <Legend iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          
          <div className="card-glass p-6">
            <h3 className="font-semibold text-textPrimary mb-1">Projected Wealth Growth</h3>
            <p className="text-xs text-textSecondary mb-4">Based on current savings rate</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[
                { year: '2024', wealth: 5000 }, { year: '2025', wealth: 8500 }, { year: '2026', wealth: 13200 },
                { year: '2027', wealth: 19800 }, { year: '2028', wealth: 28500 }, { year: '2029', wealth: 40000 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD', maximumFractionDigits: 0 }).format(v/1000) + 'k'} />
                <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Line type="monotone" dataKey="wealth" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Net Worth" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
