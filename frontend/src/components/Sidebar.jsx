import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, CreditCard, Target,
  BarChart2, User, Settings, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Habits', icon: TrendingUp, to: '/habits' },
  { label: 'Expenses', icon: CreditCard, to: '/expenses' },
  { label: 'Goals', icon: Target, to: '/goals' },
  { label: 'Analytics', icon: BarChart2, to: '/analytics' },
  { label: 'Profile', icon: User, to: '/profile' },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col shadow-sm">
      
      <div className="flex items-center justify-center px-6 py-5 border-b border-border">
        <img src="/logo.jpg" alt="Financio Logo" className="h-12 object-contain rounded-md" />
      </div>

      
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary ml-[-4px] pl-[16px]'
                  : 'text-textSecondary hover:bg-surface-container hover:text-textPrimary'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-textPrimary truncate">{user?.name}</p>
            <p className="text-xs text-textSecondary capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
