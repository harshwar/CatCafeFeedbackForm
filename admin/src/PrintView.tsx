import React, { useMemo, useEffect } from 'react';
import type { InsightsData } from './types';
import { getRadarData, getSourceROI } from './utils/analytics';
import { OperationsRadarChart } from './components/charts/OperationsRadarChart';
import { StandardBarChart } from './components/charts/StandardBarChart';
import { PawPrint, Star, TrendingUp, Target, MessageSquare, Heart } from 'lucide-react';

interface PrintViewProps {
  insights: InsightsData | null;
}

export const PrintView: React.FC<PrintViewProps> = ({ insights }) => {
  const radarData = useMemo(() => getRadarData(insights?.allFeedback || []), [insights?.allFeedback]);
  const sourceROIData = useMemo(() => getSourceROI(insights?.allFeedback || []), [insights?.allFeedback]);

  const stats = {
    total: (insights?.stats as any)?.total || 0,
    avgRating: (insights?.stats as any)?.avgRating || 0,
    satisfaction: (insights?.stats as any)?.satisfaction || 0,
  };

  useEffect(() => {
    // Tell Puppeteer that the page is ready for capture
    // We add a small delay to ensure charts finish animating
    const timer = setTimeout(() => {
      (window as any).isReportReady = true;
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!insights) return <div className="p-20 text-center">Loading Report Data...</div>;

  return (
    <div className="bg-white min-h-screen p-12 max-w-[1000px] mx-auto text-stone-900 printable-area">
      {/* PDF Header */}
      <div className="flex justify-between items-start border-b-2 border-orange-100 pb-8 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 rounded-2xl p-3 text-white">
            <PawPrint size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-stone-800">The Gentle Host</h1>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">Operational Insights Report</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-stone-400 uppercase">Generated On</p>
          <p className="text-lg font-bold text-stone-700">{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-orange-500 rounded-full" /> Executive Summary
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <MessageSquare size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Total Feedback</span>
            </div>
            <p className="text-3xl font-black text-stone-800">{stats.total}</p>
          </div>
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Star size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Avg. Rating</span>
            </div>
            <p className="text-3xl font-black text-stone-800">{stats.avgRating.toFixed(1)} / 5.0</p>
          </div>
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Heart size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Satisfaction</span>
            </div>
            <p className="text-3xl font-black text-stone-800">{stats.satisfaction}%</p>
          </div>
        </div>
      </section>

      {/* Operations Analysis */}
      <div className="flex flex-col gap-10 mb-12">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <Target size={20} className="text-orange-500" /> Operations Radar
          </h2>
          <div className="bg-white border border-stone-100 p-8 rounded-[2rem] shadow-sm" style={{ width: '900px', height: '450px' }}>
            <OperationsRadarChart data={radarData} />
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" /> Source ROI
          </h2>
          <div className="bg-white border border-stone-100 p-8 rounded-[2rem] shadow-sm" style={{ width: '900px', height: '450px' }}>
            <StandardBarChart data={sourceROIData} dataKey="avgRating" nameKey="source" fillColor="#fb923c" yAxisDomain={[0, 5]} />
          </div>
        </section>
      </div>

      {/* Voice of Customer */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-orange-500" /> Key Customer Sentiment
        </h2>
        <div className="space-y-4">
          {insights.topComments?.best.slice(0, 2).map((fb, idx) => (
            <div key={idx} className="p-5 bg-green-50 border-l-4 border-green-500 rounded-r-2xl">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-800">{fb.fullName}</span>
                <span className="text-xs font-black bg-green-200 text-green-800 px-2 py-0.5 rounded uppercase">Highest Praise</span>
              </div>
              <p className="text-stone-700 italic text-sm">"{fb.experience}"</p>
            </div>
          ))}
          {insights.topComments?.worst.slice(0, 1).map((fb, idx) => (
            <div key={idx} className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-2xl">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-red-800">{fb.fullName}</span>
                <span className="text-xs font-black bg-red-200 text-red-800 px-2 py-0.5 rounded uppercase">Action Required</span>
              </div>
              <p className="text-stone-700 italic text-sm">"{fb.experience}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-auto pt-10 border-t border-stone-100 text-center">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          The Gentle Host Admin Portal © {new Date().getFullYear()} • Confidential Operational Data
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .printable-area { padding: 0 !important; }
          body { background: white !important; }
        }
        /* Ensure Recharts animations are visible for Puppeteer */
        .recharts-wrapper { animation: none !important; }
      `}} />
    </div>
  );
};
