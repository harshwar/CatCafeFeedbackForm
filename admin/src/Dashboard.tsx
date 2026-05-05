import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Star, Heart, TrendingUp, TrendingDown, 
  Calendar, PieChart, Info, ChevronLeft, ChevronRight,
  ExternalLink, Sparkles, AlertTriangle
} from 'lucide-react';
import type { InsightsData, FeedbackEntry } from './types';
import { 
  getVolumeData, getSourceData, getPerformanceData, getDayOfWeekData,
  getTrendData, getLowestCategory
} from './utils/analytics';
import { StandardLineChart } from './components/charts/StandardLineChart';
import { StandardPieChart } from './components/charts/StandardPieChart';
import { StandardBarChart } from './components/charts/StandardBarChart';
import { TrendArrow } from './components/TrendArrow';

interface DashboardProps {
  insights: InsightsData | null;
  onNavigate: (view: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ insights, onNavigate }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const rawStats = insights?.stats as any || {};
  const stats = {
    total: rawStats.total || 0,
    avgRating: rawStats.avgRating || 0,
    satisfaction: rawStats.satisfaction || 0,
    thisWeek: rawStats.thisWeekCount || 0,
  };

  const allFeedback = insights?.allFeedback || (insights as any)?.feedback || [];
  const performanceData = useMemo(() => getPerformanceData(allFeedback), [allFeedback]);
  const dayOfWeekData = useMemo(() => getDayOfWeekData(allFeedback), [allFeedback]);
  const sourceData = useMemo(() => getSourceData(allFeedback), [allFeedback]);
  const trends = useMemo(() => getTrendData(allFeedback), [allFeedback]);
  const lowestCategory = useMemo(() => getLowestCategory(allFeedback), [allFeedback]);

  const recentFeedback = useMemo(() => allFeedback.slice(0, 5), [allFeedback]);

  // Auto-slide carousel
  useEffect(() => {
    if (recentFeedback.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % recentFeedback.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [recentFeedback]);

  if (stats.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-[2.5rem] border border-orange-100 p-12 text-center shadow-sm">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-400">
          <MessageSquare size={48} />
        </div>
        <h3 className="text-2xl font-bold text-stone-800 mb-2">Ready for Insights?</h3>
        <p className="text-stone-500 max-w-sm mb-8">
          Once your customers start sharing their thoughts, your business intelligence dashboard will come alive.
        </p>
        <button 
          onClick={() => onNavigate('feedback')}
          className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 hover:-translate-y-1 active:translate-y-0"
        >
          View Feedback Page
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* 1. TOP BANNER SECTION (Full Width) */}
      <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-orange-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles size={160} className="text-orange-600" />
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
              <Sparkles size={28} />
            </div>
            <h4 className="text-2xl font-black text-stone-800 tracking-tight">Business Intelligence Summary</h4>
          </div>
          <p className="text-3xl text-stone-800 leading-tight font-black tracking-tight max-w-4xl">
            {insights?.summary || "Analyzing your feedback patterns..."}
          </p>
        </div>
      </motion.div>

      {/* 2. CRITICAL HIGHLIGHTS (Sub-Banner) */}
      {lowestCategory && (
        <motion.div variants={itemVariants} className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-0.5">Critical Focus Area This Week</p>
              <h5 className="text-xl font-black text-red-700">{lowestCategory.category}</h5>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center md:text-right">
              <p className="text-2xl font-black text-red-600">{lowestCategory.score}</p>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Category Score</p>
            </div>
            <button 
              onClick={() => onNavigate('feedback')}
              className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl text-sm shadow-sm hover:shadow-md transition-all"
            >
              View Related Feedback
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. ASYMMETRIC BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-auto">
        
        {/* STATS: TOTAL (Span 3) */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-sm flex flex-col justify-between">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Feedback</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-stone-800">{stats.total}</span>
              {trends.countTrend !== 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trends.countTrend > 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                  {trends.countTrend > 0 ? '↑' : '↓'} {Math.abs(trends.countTrend)}%
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* STATS: RATING (Span 3) */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-sm flex flex-col justify-between">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Avg Rating</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-stone-800">{stats.avgRating}</span>
              {trends.ratingTrend !== 0 && (
                <span className={`text-xs font-bold ${trends.ratingTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trends.ratingTrend > 0 ? '↑' : '↓'} {Math.abs(trends.ratingTrend)}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* RECENT VOICE CAROUSEL (Span 6) */}
        <motion.div variants={itemVariants} className="lg:col-span-6 bg-[#1d1b19] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden min-h-[280px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-orange-400">
                  <MessageSquare size={18} />
                </div>
                <h4 className="text-lg font-bold">Recent Voice</h4>
              </div>
              <div className="flex gap-1">
                {recentFeedback.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-6 bg-orange-500' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <p className="text-2xl font-medium italic leading-snug line-clamp-2 text-orange-50">
                    "{recentFeedback[carouselIndex]?.experience}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-orange-500/20">
                      {recentFeedback[carouselIndex]?.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-white">{recentFeedback[carouselIndex]?.fullName}</span>
                      <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-widest">{recentFeedback[carouselIndex]?.timestamp}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* VOLUME CHART (Span 8) */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                <Calendar size={18} />
              </div>
              <h4 className="text-lg font-bold text-stone-800">Visit Frequency</h4>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-stone-50 rounded-lg text-xs font-bold text-stone-500">Last 7 Days</span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <StandardBarChart data={dayOfWeekData} dataKey="count" nameKey="name" fillColor="#f6a04d" />
          </div>
        </motion.div>

        {/* SATISFACTION (Span 4) */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-orange-500 p-8 rounded-[2.5rem] shadow-lg shadow-orange-100 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
              <Heart size={28} />
            </div>
            <p className="text-xs font-bold text-orange-100 uppercase tracking-widest mb-1">Customer Satisfaction</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-6xl font-black text-white">{stats.satisfaction}%</span>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <p className="text-sm font-bold leading-tight">Excellent! Your customers love the cafe experience.</p>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('reports')}
            className="mt-8 w-full py-4 bg-white text-orange-600 rounded-2xl text-sm font-black shadow-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
          >
            Full Analytics <ExternalLink size={14} />
          </button>
        </motion.div>

        {/* PERFORMANCE BARS (Span 12) */}
        <motion.div variants={itemVariants} className="lg:col-span-12 bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
              <TrendingUp size={18} />
            </div>
            <h4 className="text-xl font-black text-stone-800">Operational Category Overview</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
            {performanceData.map((item) => (
              <div key={item.category} className="group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-600 transition-colors">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-stone-800">{item.score}</span>
                    {item.trend !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {item.trend > 0 ? '↑' : '↓'} {Math.abs(item.trend)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2.5 bg-stone-50 rounded-full overflow-hidden border border-stone-100 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.score / 5) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${item.score >= 4.5 ? 'bg-green-500' : item.score >= 3.5 ? 'bg-orange-400' : 'bg-red-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
