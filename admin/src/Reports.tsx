import React, { useMemo, useRef, useState } from 'react';
import type { FeedbackEntry } from './types';
import { getRadarData, getSourceROI, getOtherSourceBreakdown } from './utils/analytics';
import { exportToCSV } from './utils/export';
import { OperationsRadarChart } from './components/charts/OperationsRadarChart';
import { StandardBarChart } from './components/charts/StandardBarChart';
import { BarChart3, Download, Target, TrendingUp, Search, Loader2 } from 'lucide-react';

interface Props {
  feedbacks: FeedbackEntry[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Reports: React.FC<Props> = ({ feedbacks }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const radarData = useMemo(() => getRadarData(feedbacks), [feedbacks]);
  const sourceROIData = useMemo(() => getSourceROI(feedbacks), [feedbacks]);
  const otherBreakdown = useMemo(() => getOtherSourceBreakdown(feedbacks), [feedbacks]);

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(feedbacks, `cat_cafe_feedback_${timestamp}`);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${API_URL}/api/export-pdf`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Backend failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cat_Cafe_Operational_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Backend PDF Export failed:', error);
      alert(`PDF Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-stone-100 text-stone-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-200 transition-colors shadow-sm"
          >
            <Download size={16} /> CSV
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-sm ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} 
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div ref={reportRef} data-report-container="true" className="space-y-8 p-4 -m-4 rounded-[2rem] bg-stone-50/50">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Operations Radar */}
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50 grid-item">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Target size={20} className="text-orange-500" /> Operations Radar
              </h3>
              <p className="text-stone-500 text-sm mt-1">Average scores across service categories.</p>
            </div>
            <div data-chart-wrapper="true" style={{ height: '350px' }} className="chart-box">
              <OperationsRadarChart data={radarData} />
            </div>
          </div>

          {/* Source ROI */}
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50 grid-item">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-500" /> Source ROI
              </h3>
              <p className="text-stone-500 text-sm mt-1">Average rating by discovery source.</p>
            </div>
            <div data-chart-wrapper="true" style={{ height: '350px' }} className="chart-box">
              <StandardBarChart data={sourceROIData} dataKey="avgRating" nameKey="source" fillColor="#fb923c" yAxisDomain={[0, 5]} />
            </div>
          </div>
        </div>

        {/* Other Source Breakdown */}
        {otherTotal > 0 && (
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50 other-section">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Search size={20} className="text-orange-500" /> "Other" Breakdown
                </h3>
                <p className="text-stone-500 text-sm mt-1">Specific discovery mentions for "Other" category.</p>
              </div>
              <div className="bg-orange-50 text-orange-700 font-bold text-sm px-4 py-2 rounded-xl border border-orange-100">
                {otherTotal} responses
              </div>
            </div>
            <div className="space-y-4">
              {otherBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-stone-700 text-sm">{item.name}</span>
                      <span className="text-sm font-bold text-stone-800">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl summary-item">
            <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Top Performer</p>
            <p className="text-2xl font-bold text-stone-800">
              {radarData.length > 0 ? [...radarData].sort((a, b) => b.score - a.score)[0].category : 'N/A'}
            </p>
          </div>
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl summary-item">
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Area to Improve</p>
            <p className="text-2xl font-bold text-stone-800">
              {radarData.length > 0 ? [...radarData].sort((a, b) => a.score - b.score)[0].category : 'N/A'}
            </p>
          </div>
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl summary-item">
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Highest ROI Source</p>
            <p className="text-2xl font-bold text-stone-800">
              {sourceROIData.length > 0 ? sourceROIData[0].source : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
