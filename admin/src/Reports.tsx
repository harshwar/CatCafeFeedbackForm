import React, { useMemo } from 'react';
import type { FeedbackEntry } from './types';
import { getRadarData, getSourceROI, getOtherSourceBreakdown } from './utils/analytics';
import { exportToCSV } from './utils/export';
import { OperationsRadarChart } from './components/charts/OperationsRadarChart';
import { StandardBarChart } from './components/charts/StandardBarChart';
import { BarChart3, Download, Target, TrendingUp, Search } from 'lucide-react';

interface Props {
  feedbacks: FeedbackEntry[];
}

export const Reports: React.FC<Props> = ({ feedbacks }) => {
  const radarData = useMemo(() => getRadarData(feedbacks), [feedbacks]);
  const sourceROIData = useMemo(() => getSourceROI(feedbacks), [feedbacks]);
  const otherBreakdown = useMemo(() => getOtherSourceBreakdown(feedbacks), [feedbacks]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(feedbacks, `cat_cafe_feedback_${timestamp}`);
  };

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
        <BarChart3 size={48} className="mb-4 opacity-50" />
        <p className="font-medium">No feedback available to generate reports.</p>
      </div>
    );
  }

  const otherTotal = feedbacks.filter(fb => fb.source?.toLowerCase() === 'other').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <BarChart3 className="text-orange-600" /> Operational Reports
          </h2>
          <p className="text-stone-500 text-sm mt-1">Track business performance across key metrics.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Operations Radar */}
        <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Target size={20} className="text-orange-500" /> Operations Radar
            </h3>
            <p className="text-stone-500 text-sm mt-1">Average scores across all core service categories.</p>
          </div>
          <OperationsRadarChart data={radarData} />
        </div>

        {/* Source ROI */}
        <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" /> Source ROI
            </h3>
            <p className="text-stone-500 text-sm mt-1">Average rating grouped by discovery source.</p>
          </div>
          <StandardBarChart data={sourceROIData} dataKey="avgRating" nameKey="source" fillColor="#fb923c" yAxisDomain={[0, 5]} />
        </div>
      </div>

      {/* "Other" Source Deep-Dive */}
      {otherTotal > 0 && (
        <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Search size={20} className="text-orange-500" /> "Other" Source Breakdown
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Deep-dive into what customers wrote when they selected "Other" as their discovery source.{' '}
                <span className="font-semibold text-stone-700">{otherTotal} total entries</span> in this group.
              </p>
            </div>
            <div className="bg-orange-50 text-orange-700 font-bold text-sm px-4 py-2 rounded-xl border border-orange-100">
              {otherTotal} responses
            </div>
          </div>

          {otherBreakdown.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p className="font-medium">No freetext responses were provided by these customers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-4 group">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-stone-700 text-sm group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400 font-medium">{item.count} {item.count === 1 ? 'response' : 'responses'}</span>
                        <span className="text-sm font-bold text-stone-800 w-10 text-right">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mini Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
          <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Top Performer</p>
          <p className="text-2xl font-bold text-stone-800">
            {radarData.length > 0 ? [...radarData].sort((a, b) => b.score - a.score)[0].category : 'N/A'}
          </p>
        </div>
        <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Area to Improve</p>
          <p className="text-2xl font-bold text-stone-800">
            {radarData.length > 0 ? [...radarData].sort((a, b) => a.score - b.score)[0].category : 'N/A'}
          </p>
        </div>
        <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Highest ROI Source</p>
          <p className="text-2xl font-bold text-stone-800">
            {sourceROIData.length > 0 ? sourceROIData[0].source : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
