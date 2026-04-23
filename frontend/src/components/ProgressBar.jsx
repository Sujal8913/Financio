export default function ProgressBar({ value, max = 100, color = 'primary' }) {
  const pct = Math.min((value / max) * 100, 100);
  const gradients = {
    primary: 'from-primary to-secondary',
    red: 'from-red-400 to-orange-400',
    purple: 'from-purple-400 to-primary',
  };
  return (
    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradients[color] || gradients.primary} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
