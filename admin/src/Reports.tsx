import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { FeedbackEntry } from './types';
import { getRadarData, getSourceROI, getOtherSourceBreakdown } from './utils/analytics';
import { exportToCSV } from './utils/export';
import { OperationsRadarChart } from './components/charts/OperationsRadarChart';
import { StandardBarChart } from './components/charts/StandardBarChart';
import { BarChart3, Download, Target, TrendingUp, Search, Loader2 } from 'lucide-react';

interface Props {
  feedbacks: FeedbackEntry[];
}

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
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      // Use onclone to sanitize the cloned document before rendering
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // 1. Force a fixed width for the report container to ensure Recharts has space to render
          const reportElement = clonedDoc.querySelector('[data-report-container="true"]') as HTMLElement;
          if (reportElement) {
            reportElement.style.width = '1200px';
            reportElement.style.padding = '40px';
          }

          // 2. STERN FIX: Remove all <style> tags that might contain oklab/oklch
          // And inject a simple, compatible stylesheet for the PDF
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = styles.length - 1; i >= 0; i--) {
            styles[i].remove();
          }

          const compatibleStyle = clonedDoc.createElement('style');
          compatibleStyle.innerHTML = `
            * {
              box-sizing: border-box;
              font-family: sans-serif !important;
              color: #1d1b19 !important;
            }
            .bg-white { background-color: #ffffff !important; }
            .bg-stone-50 { background-color: #fafaf9 !important; }
            .bg-orange-50 { background-color: #fff7ed !important; }
            .bg-orange-400 { background-color: #fb923c !important; }
            .bg-orange-500 { background-color: #f97316 !important; }
            .bg-green-50\\/50 { background-color: #f0fdf4 !important; }
            .bg-red-50\\/50 { background-color: #fef2f2 !important; }
            .text-orange-500 { color: #f97316 !important; }
            .text-orange-600 { color: #ea580c !important; }
            .text-stone-500 { color: #78716c !important; }
            .text-stone-800 { color: #1c1917 !important; }
            .border-orange-50 { border-color: #fff7ed !important; }
            .border-orange-100 { border-color: #ffedd5 !important; }
            .border-stone-100 { border-color: #f5f5f4 !important; }
            .rounded-\\[1\\.5rem\\] { border-radius: 1.5rem !important; }
            .rounded-2xl { border-radius: 1rem !important; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .xl\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-8 { gap: 2rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .space-y-8 > * + * { margin-top: 2rem !important; }
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .h-3 { height: 0.75rem !important; }
            .w-full { width: 100% !important; }
          `;
          clonedDoc.head.appendChild(compatibleStyle);
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Cat_Cafe_Operational_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
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
      {/* Header (Not in PDF) */}
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
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Target size={20} className="text-orange-500" /> Operations Radar
              </h3>
              <p className="text-stone-500 text-sm mt-1">Average scores across all core service categories.</p>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <OperationsRadarChart data={radarData} />
            </div>
          </div>

          {/* Source ROI */}
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-orange-50">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-500" /> Source ROI
              </h3>
              <p className="text-stone-500 text-sm mt-1">Average rating grouped by discovery source.</p>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <StandardBarChart data={sourceROIData} dataKey="avgRating" nameKey="source" fillColor="#fb923c" yAxisDomain={[0, 5]} />
            </div>
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

            <div className="space-y-4">
              {otherBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-4 group">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-stone-700 text-sm">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400 font-medium">{item.count} responses</span>
                        <span className="text-sm font-bold text-stone-800 w-10 text-right">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
};
