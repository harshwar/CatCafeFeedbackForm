import React, { useMemo, useRef, useState } from 'react';
import type { FeedbackEntry } from './types';
import { getRadarData, getSourceROI } from './utils/analytics';
import { exportToCSV } from './utils/export';
import { OperationsRadarChart } from './components/charts/OperationsRadarChart';
import { StandardBarChart } from './components/charts/StandardBarChart';
import { BarChart3, Download, Target, TrendingUp, Search, Loader2 } from 'lucide-react';
import { useToast } from './components/Toast';

interface Props {
  feedbacks: FeedbackEntry[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Reports: React.FC<Props> = ({ feedbacks }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const radarData = useMemo(() => getRadarData(feedbacks), [feedbacks]);
  const { showToast } = useToast();

  const handleExportCSV = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      exportToCSV(feedbacks, `cat_cafe_feedback_${timestamp}`);
      showToast('CSV exported successfully!');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const handleExportPDF = async () => {
    showToast('Redirecting to print view...', 'info');
    setTimeout(() => {
      window.open('/?view=print', '_blank');
    }, 1000);
  };

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
        <BarChart3 size={48} className="mb-4 opacity-50" />
        <p className="font-medium">No feedback available to generate reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <BarChart3 className="text-orange-600" /> Reports
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
        <div className="flex flex-col gap-8">
          {/* Operations Radar */}
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50 grid-item">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Target size={20} className="text-orange-500" /> Category Overview
              </h3>
              <p className="text-stone-500 text-sm mt-1">Average scores across service categories.</p>
            </div>
            <div data-chart-wrapper="true" style={{ height: '350px' }} className="chart-box">
              <OperationsRadarChart data={radarData} />
            </div>
          </div>


        </div>



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

        </div>
      </div>
    </div>
  );
};
