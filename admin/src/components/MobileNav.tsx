import React from 'react';
import { LayoutDashboard, MessageSquare, Users, BarChart3 } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
  { id: 'feedback', icon: <MessageSquare size={20} />, label: 'Feed' },
  { id: 'insights', icon: <Users size={20} />, label: 'People' },
  { id: 'reports', icon: <BarChart3 size={20} />, label: 'Stats' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-orange-100 flex items-center justify-around px-2 lg:hidden z-[60] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {MENU_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
            currentView === item.id 
              ? 'text-orange-600 font-bold' 
              : 'text-stone-400'
          }`}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${currentView === item.id ? 'bg-orange-50' : ''}`}>
            {item.icon}
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
