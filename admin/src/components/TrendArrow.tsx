import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendArrowProps {
  current: number;
  previous?: number;
  className?: string;
}

export const TrendArrow: React.FC<TrendArrowProps> = ({ current, previous, className = '' }) => {
  if (previous === undefined) return <Minus size={14} className={`text-stone-300 ${className}`} />;
  
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return <Minus size={14} className={`text-stone-300 ${className}`} />;
  
  return diff > 0 
    ? <TrendingUp size={18} className={`text-green-500 ${className}`} />
    : <TrendingDown size={18} className={`text-red-400 ${className}`} />;
};
