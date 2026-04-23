import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-emerald-500 to-primary flex-col justify-between p-12">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Financio Logo" className="h-14 object-contain rounded-md shadow-sm" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">Start your wealth<br />building journey today</h2>
          <p className="text-emerald-100 text-lg">Join thousands of users turning small daily habits into lasting financial success.</p>
          <div className="mt-8 space-y-3">
            {['Track every expense, no matter how small','Build streaks that build wealth','Set & achieve meaningful savings goals'].map(f => (
              <div key={f} className="flex items-center gap-3 text-emerald-100">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs text-white">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-emerald-200 text-sm">© 2024 Financio. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center lg:hidden mb-8">
            <img src="/logo.jpg" alt="Financio Logo" className="h-10 object-contain rounded-md shadow-sm" />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Create account</h1>
          <p className="text-textSecondary mb-8">Start your financial habit journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input id="reg-name" type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input id="reg-email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input id="reg-password" type={show ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input id="reg-confirm" type="password" placeholder="Repeat password" value={form.confirm}
                  onChange={e => setForm({...form, confirm: e.target.value})} className="input-field pl-10" required />
              </div>
            </div>
            <button id="reg-submit" type="submit" disabled={loading} className="btn-secondary w-full py-3 text-base justify-center">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
