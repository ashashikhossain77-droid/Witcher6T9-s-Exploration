import React from 'react';
import { PageId } from '../types';
import { Home, CheckSquare, Layers, Calendar, BarChart3, ListTodo, Wrench } from 'lucide-react';

interface BottomNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems: { id: PageId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'checklist', label: 'Daily', icon: CheckSquare },
    { id: 'todo-schedule', label: 'To-Do & Time', icon: ListTodo },
    { id: 'linedata', label: 'Line', icon: Layers },
    { id: 'lean-toolkit', label: 'Lean', icon: Wrench },
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl md:w-full md:rounded-2xl md:border md:border-[#d9d2c2] bg-[#fbfaf6]/95 backdrop-blur-md border-t border-[#d9d2c2] z-30 shadow-[0_-4px_20px_rgba(23,52,58,0.10)] md:shadow-xl transition-all">
      <div className="max-w-md md:max-w-xl mx-auto flex items-stretch justify-around px-2 py-1.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'reports' && currentPage === 'kpi-reports');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-testid={`button-nav-${item.id}`}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-0 flex-1 rounded-xl transition-all ${
                isActive
                   ? 'bg-[#dceceb] text-[#176f78] font-bold'
                   : 'text-slate-400 hover:text-slate-600 hover:bg-[#f1eee6]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#176f78]' : 'text-slate-400'}`} />
              <span className={`text-[11px] leading-none ${isActive ? 'font-bold text-[#176f78]' : 'font-medium text-slate-500'}`}>
                {item.label}
              </span>
              <span
                className={`w-1 h-1 rounded-full transition-all ${
                   isActive ? 'bg-[#e6813e]' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
