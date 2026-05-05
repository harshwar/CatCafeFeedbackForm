import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentView, onNavigate }) => {
  const label = currentView.charAt(0).toUpperCase() + currentView.slice(1);
  
  return (
    <nav className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest mb-6">
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"
      >
        <Home size={14} />
        Portal
      </button>
      <ChevronRight size={12} className="text-stone-400" />
      <span className="text-stone-700">{label}</span>
    </nav>
  );
};
