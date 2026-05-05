import React from 'react';
import { Printer, Download, Share2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const FORM_URL = 'https://script.google.com/macros/s/AKfycbwhqBbr2n82HvWLhJlJMQhs4N2DIl6uVbV_voBH9v70LabctDLLMf1n28ka1Ug-hlu92A/exec';

export const QRCodePage: React.FC = () => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(FORM_URL)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
          <Printer size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Print Feedback QR</h2>
          <p className="text-sm text-stone-500">Generate and print cards for your cafe tables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Preview Section */}
        <div className="lg:col-span-7">
          <div className="bg-white p-12 rounded-[2.5rem] border border-orange-50 shadow-sm flex flex-col items-center text-center print:shadow-none print:border-none print:p-0">
            <h3 className="text-3xl font-black text-stone-800 mb-2">The Gentle Host</h3>
            <p className="text-stone-500 font-medium mb-12">Cat Café & Sanctuary</p>
            
            <div className="bg-stone-50 p-8 rounded-[2rem] border-2 border-stone-100 mb-12 print:border-stone-200">
              <img 
                src={qrUrl} 
                alt="Feedback QR Code" 
                className="w-64 h-64 mix-blend-multiply"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-bold text-stone-800">Tell us about your visit!</p>
              <p className="text-stone-500 max-w-xs">Scan the code to share your feedback. It takes less than 2 minutes.</p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-sm">
            <h4 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Info size={18} className="text-orange-500" /> Print Settings
            </h4>
            
            <div className="space-y-4">
              <button 
                onClick={handlePrint}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
              >
                <Printer size={20} /> Print A4 Sheet
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={qrUrl} 
                  download="cat-cafe-qr.png"
                  className="py-3 bg-stone-50 text-stone-600 rounded-xl font-bold border border-stone-200 hover:bg-stone-100 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={16} /> Image
                </a>
                <button 
                  onClick={() => navigator.clipboard.writeText(FORM_URL)}
                  className="py-3 bg-stone-50 text-stone-600 rounded-xl font-bold border border-stone-200 hover:bg-stone-100 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 size={16} /> Link
                </button>
              </div>
            </div>

            <div className="mt-12 p-6 bg-orange-50 rounded-2xl border border-orange-100">
              <h5 className="font-bold text-orange-800 mb-2">Owner's Tip</h5>
              <p className="text-sm text-orange-700 leading-relaxed">
                Place these QR codes near the billing counter or on every table. Customers are 80% more likely to leave feedback if the code is visible during their meal.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .lg\\:col-span-7, .lg\\:col-span-7 * { visibility: visible; }
          .lg\\:col-span-7 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </motion.div>
  );
};
