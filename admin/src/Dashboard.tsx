import React, { useMemo, useState } from 'react';
import { StatCard } from './components/StatCard';
import { MessageSquare, Star, Heart, Users, ExternalLink, AlertTriangle, Zap } from 'lucide-react';
import type { InsightsData } from './types';
import { getVolumeData, getSourceData, getPerformanceData } from './utils/analytics';
import type { TimeRange } from './utils/analytics';
import { StandardLineChart } from './components/charts/StandardLineChart';
import { StandardPieChart } from './components/charts/StandardPieChart';

interface DashboardProps {
 insights: InsightsData | null;
 onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ insights, onNavigate }) => {
 const [timeRange, setTimeRange] = useState<TimeRange>('30_days');

 const rawStats = insights?.stats as any || {};
 const stats = {
 total: rawStats.total || 0,
 avgRating: rawStats.avgRating || 0,
 satisfaction: rawStats.satisfaction || 0,
 returningRate: rawStats.returningRate ?? rawStats.responseRate ?? 0,
 };

 const volumeData = useMemo(() => getVolumeData(insights?.allFeedback || [], timeRange), [insights?.allFeedback, timeRange]);
 const sourceData = useMemo(() => getSourceData(insights?.allFeedback || []), [insights?.allFeedback]);
 const performanceData = useMemo(() => getPerformanceData(insights?.allFeedback || []), [insights?.allFeedback]);

 return (
 <div className="space-y-8">
  {(insights?.syncStatus?.localFailures ?? 0) > 0 && (
  <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center gap-3 text-orange-800 text-sm">
  <Zap size={18} className="text-orange-500" />
  <span>You have <strong>{insights?.syncStatus?.localFailures}</strong> unsynced feedbacks logged locally. Please check your n8n connection.</span>
  </div>
  )}
 
 {/* Metrics Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard 
 title="Total Feedbacks" 
 value={stats.total} 
 icon={<MessageSquare size={20} />} 
 trend="+12%" 
 trendUp={true} 
 />
 <StatCard 
 title="Average Rating" 
 value={stats.avgRating} 
 icon={<Star size={20} />} 
 trend="High" 
 trendUp={true} 
 />
 <StatCard 
 title="Satisfaction Score" 
 value={`${stats.satisfaction}%`} 
 icon={<Heart size={20} />} 
 trend={stats.satisfaction >= 80 ? 'Strong' : stats.satisfaction >= 60 ? 'Moderate' : 'Needs Work'}
 trendUp={stats.satisfaction >= 60} 
 />
 <StatCard 
 title="Returning Visitors" 
 value={`${stats.returningRate}%`} 
 icon={<Users size={20} />} 
 trend={stats.returningRate >= 50 ? 'Loyal Base' : 'Growing'}
 trendUp={true} 
 />
 </div>

 {/* Main Charts Row */}
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
 {/* Volume Chart */}
 <div className="xl:col-span-8 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
 <div className="flex justify-between items-center mb-6">
 <h4 className="text-xl font-bold text-on-surface">Feedback Volume</h4>
 <select 
 value={timeRange} 
 onChange={(e) => setTimeRange(e.target.value as TimeRange)}
 className="bg-stone-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-orange-200"
 >
 <option value="30_days">Last 30 Days</option>
 <option value="3_months">Last 3 Months</option>
 <option value="1_year">This Year</option>
 <option value="all">All Time</option>
 </select>
 </div>
 <div className="h-[300px] w-full pt-4">
 <StandardLineChart data={volumeData} dataKey="count" nameKey="date" strokeColor="#f6a04d" />
 </div>
 </div>

 {/* Discovery Sources Pie */}
 <div className="xl:col-span-4 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
 <h4 className="text-xl font-bold text-on-surface mb-6">Discovery Sources</h4>
 <div className="h-[250px] w-full relative">
 <StandardPieChart data={sourceData} nameKey="name" dataKey="value" />
 <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
 <span className="text-2xl font-bold text-on-surface">{sourceData[0]?.value || 0}%</span>
 <span className="text-[10px] text-stone-500 uppercase font-bold">{sourceData[0]?.name || 'N/A'}</span>
 </div>
 </div>
 <div className="mt-4 space-y-3">
 {sourceData.map((source) => (
 <div key={source.name} className="flex items-center justify-between text-sm">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
 <span className="text-stone-600">{source.name}</span>
 </div>
 <span className="font-bold">{source.value}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Bottom Row */}
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
 {/* Performance Bars */}
 <div className="xl:col-span-5 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
 <h4 className="text-xl font-bold text-on-surface mb-6">Purr-formance Ratings</h4>
 <div className="space-y-6">
 {performanceData.map((item) => (
 <div key={item.category}>
 <div className="flex justify-between text-sm mb-2">
 <span className="font-medium text-stone-700">{item.category}</span>
 <span className="font-bold">{item.score}/5.0</span>
 </div>
 <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
 <div 
 className="h-full bg-orange-400 rounded-full" 
 style={{ width: `${(item.score / 5) * 100}%` }}
 ></div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Recent Feedback Feed */}
 <div className="xl:col-span-7 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
 <div className="flex justify-between items-center mb-6">
 <h4 className="text-xl font-bold text-on-surface">Recent Purr-spective</h4>
 <button 
 onClick={() => onNavigate('feedback')}
 className="text-orange-600 font-bold text-sm hover:underline"
 >
 View All
 </button>
 </div>
 <div className="space-y-4">
 {(insights?.allFeedback || []).slice(0, 3).map((fb, idx) => (
 <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-transparent hover:border-orange-200 transition-all group">
 <div className="flex justify-between items-start mb-2">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-stone-200 text-stone-600'}`}>
 {fb.fullName.split(' ').map(n => n[0]).join('')}
 </div>
 <div>
 <p className="font-bold text-on-surface text-sm">{fb.fullName}</p>
 <p className="text-[10px] text-stone-500 uppercase font-bold">{fb.timestamp}</p>
 </div>
 </div>
 <div className="flex gap-0.5 text-orange-400">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={12} fill={i < (fb.service || 0) ? 'currentColor' : 'none'} />
 ))}
 </div>
 </div>
 <p className="text-sm text-stone-600 line-clamp-2 mb-3">"{fb.experience}"</p>
 <div className="flex justify-between items-center">
 <div className="flex gap-2">
 {(fb.interests || 'Visiting').split(',').slice(0, 2).map((tag, i) => (
 <span key={i} className="px-3 py-1 bg-white text-[10px] font-bold uppercase rounded-full border border-stone-100">{tag.trim()}</span>
 ))}
 </div>
 <button className="text-orange-600 font-bold text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
 View Full <ExternalLink size={12} />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Top Comments (Best & Worst) */}
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
 {/* Best Reviews */}
 <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-stone-100">
 <div className="flex items-center gap-2 mb-6 text-green-600">
 <Star size={24} fill="currentColor" />
 <h4 className="text-xl font-bold">Top Praises</h4>
 </div>
 <div className="space-y-4">
 {insights?.topComments?.best.map((fb, idx) => (
 <div key={idx} className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
 <div className="flex justify-between items-center mb-2">
 <span className="font-bold text-sm text-on-surface">{fb.fullName}</span>
 <span className="font-bold text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg">{fb.avgRating?.toFixed(1)} / 5.0</span>
 </div>
 <p className="text-sm text-stone-600 italic">"{fb.experience}"</p>
 </div>
 ))}
 {(!insights?.topComments?.best || insights.topComments.best.length === 0) && (
 <p className="text-stone-400 text-sm">No written reviews available yet.</p>
 )}
 </div>
 </div>

 {/* Worst Reviews */}
 <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-stone-100">
 <div className="flex items-center gap-2 mb-6 text-red-500">
 <AlertTriangle size={24} />
 <h4 className="text-xl font-bold">Needs Improvement</h4>
 </div>
 <div className="space-y-4">
 {insights?.topComments?.worst.map((fb, idx) => (
 <div key={idx} className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
 <div className="flex justify-between items-center mb-2">
 <span className="font-bold text-sm text-on-surface">{fb.fullName}</span>
 <span className="font-bold text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg">{fb.avgRating?.toFixed(1)} / 5.0</span>
 </div>
 <p className="text-sm text-stone-600 italic">"{fb.experience}"</p>
 </div>
 ))}
 {(!insights?.topComments?.worst || insights.topComments.worst.length === 0) && (
 <p className="text-stone-400 text-sm">No critical written reviews to display.</p>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};
