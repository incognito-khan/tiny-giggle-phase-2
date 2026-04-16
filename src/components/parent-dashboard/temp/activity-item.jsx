'use client';

export function ActivityItem({ icon: Icon, title, value, time, colorClass, animate = false }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-md ${colorClass} ${animate ? 'animate-fade-in' : ''}`}>
      <div className="flex-shrink-0">
        <Icon size={20} className="text-current" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{title}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <div className="flex-shrink-0">
        <p className="text-sm font-bold text-current">{value}</p>
      </div>
    </div>
  );
}
