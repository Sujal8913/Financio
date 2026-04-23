import { Bell, Search } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function Navbar({ title }) {
  const { user } = useContext(AuthContext);
  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4 sticky top-0 z-10 shadow-sm">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-textPrimary">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm bg-surface-container border border-border rounded-md w-52 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button className="relative p-2 text-textSecondary hover:text-textPrimary hover:bg-surface-container rounded-md transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-textPrimary hidden md:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
