import React from 'react';
import { LayoutDashboard, MessageSquare, BarChart3, Printer, PawPrint } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { id: 'feedback', icon: <MessageSquare size={20} />, label: 'Feedback' },
  { id: 'reports', icon: <BarChart3 size={20} />, label: 'Reports' },
  { id: 'qrcode', icon: <Printer size={20} />, label: 'Print QR' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {

  return (
    <nav className="fixed left-0 top-[64px] h-[calc(100vh-64px)] w-64 flex flex-col p-4 gap-2 bg-stone-50 border-r border-orange-100 hidden lg:flex">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-[#f6a04d] rounded-xl p-2 text-white">
          <PawPrint size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-800 leading-tight">The Gentle Host</h2>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Admin Portal</p>
        </div>
      </div>

      <div className="space-y-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-orange-100/50 text-orange-700 font-semibold' 
                : 'text-stone-600 hover:bg-stone-100 hover:translate-x-1'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

    </nav>
  );
};
