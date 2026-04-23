import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-secondary flex-col justify-between p-12">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Financio Logo" className="h-14 object-contain rounded-md shadow-sm" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Build wealth through<br />daily financial habits
          </h2>
          <p className="text-blue-100 text-lg">Track expenses, set goals, and grow your wealth — one habit at a time.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['$2.4M', 'Wealth Tracked'],['12K+','Active Users'],['98%','Habit Success']].map(([val, label]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-blue-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-sm">© 2024 Financio. All rights reserved.</p>
      </div>

      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center lg:hidden mb-8">
            <img src="/logo.jpg" alt="Financio Logo" className="h-10 object-contain rounded-md" />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Welcome back</h1>
          <p className="text-textSecondary mb-8">Sign in to continue building wealth</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input id="login-email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input id="login-password" type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 text-base justify-center">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textSecondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
