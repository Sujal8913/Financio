export default function StatCard({ title, value, icon: Icon, color = 'primary', change }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-500',
  };
  return (
    <div className="card-glass card-hover p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-textPrimary">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-secondary' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this month
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colors[color]}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
    </div>
  );
}
