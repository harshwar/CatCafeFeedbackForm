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
      // 1. Create a "Sanitized Clone" of the report element
      const originalElement = reportRef.current;
      const canvas = await html2canvas(originalElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // A. STERN FIX: Kill ALL existing styles and external links in the clone
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(el => el.remove());

          // B. Inject a 100% compatible HEX-only stylesheet
          const compatibleStyle = clonedDoc.createElement('style');
          compatibleStyle.innerHTML = `
            * {
              box-sizing: border-box !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              color: #1c1917 !important;
            }
            body { background: white !important; }
            .pdf-container { 
              width: 1100px !important; 
              padding: 40px !important; 
              background: #ffffff !important;
              display: block !important;
            }
            .grid { display: flex !important; flex-wrap: wrap !important; gap: 24px !important; }
            .grid > div { flex: 1 !important; min-width: 480px !important; }
            .bg-white { background: #ffffff !important; border: 1px solid #f5f5f4 !important; }
            .bg-stone-50 { background: #fafaf9 !important; }
            .bg-orange-50 { background: #fff7ed !important; }
            .bg-orange-400 { background: #fb923c !important; }
            .bg-orange-500 { background: #f97316 !important; }
            .text-orange-500 { color: #f97316 !important; }
            .text-orange-600 { color: #ea580c !important; }
            .text-stone-500 { color: #78716c !important; }
            .rounded-\\[1\\.5rem\\] { border-radius: 24px !important; overflow: hidden !important; }
            .p-8 { padding: 32px !important; }
            .mb-8 { margin-bottom: 32px !important; }
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .chart-box { height: 350px !important; width: 100% !important; display: block !important; }
            .summary-grid { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; gap: 16px !important; margin-top: 32px !important; }
            .summary-card { padding: 24px !important; border-radius: 16px !important; border: 1px solid #e5e7eb !important; }
          `;
          clonedDoc.head.appendChild(compatibleStyle);

          // C. Re-structure the clone for perfect PDF layout
          const reportClone = clonedDoc.querySelector('[data-report-container="true"]') as HTMLElement;
          if (reportClone) {
            reportClone.className = 'pdf-container';
            
            // Force dimensions on chart wrappers
            const chartWrappers = reportClone.querySelectorAll('[data-chart-wrapper="true"]');
            chartWrappers.forEach(w => {
              (w as HTMLElement).style.height = '350px';
              (w as HTMLElement).style.width = '500px';
              (w as HTMLElement).style.display = 'block';
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Cat_Cafe_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
      {/* Header (UI Only) */}
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
              <p className="text-stone-500 text-sm mt-1">Average scores across all service categories.</p>
            </div>
            <div data-chart-wrapper="true" className="h-[300px] w-full">
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
            <div data-chart-wrapper="true" className="h-[300px] w-full">
              <StandardBarChart data={sourceROIData} dataKey="avgRating" nameKey="source" fillColor="#fb923c" yAxisDomain={[0, 5]} />
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl summary-card">
            <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Top Performer</p>
            <p className="text-2xl font-bold text-stone-800">
              {radarData.length > 0 ? [...radarData].sort((a, b) => b.score - a.score)[0].category : 'N/A'}
            </p>
          </div>
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl summary-card">
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Area to Improve</p>
            <p className="text-2xl font-bold text-stone-800">
              {radarData.length > 0 ? [...radarData].sort((a, b) => a.score - b.score)[0].category : 'N/A'}
            </p>
          </div>
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl summary-card">
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
