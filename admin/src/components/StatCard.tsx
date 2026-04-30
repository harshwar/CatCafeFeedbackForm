import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-[1.5rem] shadow-sm shadow-orange-500/5 border border-orange-50"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-orange-100/50 text-orange-600 rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-sm font-medium opacity-70">{title}</p>
      <h3 className="text-3xl font-bold text-on-surface mt-1">{value}</h3>
    </motion.div>
  );
};
