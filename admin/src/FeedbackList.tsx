import React, { useState, useMemo, useDeferredValue, Suspense, lazy, useCallback } from 'react';
import { Star, MessageSquare, Mail, Phone, MapPin, Calendar, Clock, Link as LinkIcon, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackEntry } from './types';

// Lazy load the heavy modal to split bundle size
const FeedbackModal = lazy(() => 
  import('./components/FeedbackModal').then(module => ({ default: module.FeedbackModal }))
);

import { useToast } from './components/Toast';

interface FeedbackListProps {
  feedbacks: FeedbackEntry[];
  satisfactionThreshold: number;
}

type TabType = 'all' | 'attention' | 'best';
type DateRange = 'all' | 'week' | 'month' | 'quarter';

const ITEMS_PER_PAGE = 10;

// Extracted and Memoized RatingRow to prevent re-renders
const RatingRow = React.memo(({ label, score }: { label: string, score: any }) => {
  const numScore = parseFloat(score) || 0;
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-stone-600 font-medium">{label}</span>
      <div className="flex gap-0.5 text-orange-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} fill={i < numScore ? 'currentColor' : 'none'} />
        ))}
      </div>
    </div>
  );
});

// Extracted and Memoized FeedbackCard with Accordion Logic
const FeedbackCard = React.memo(({ fb, onSelect }: { fb: FeedbackEntry, onSelect: (fb: FeedbackEntry) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();
  const initials = (fb.fullName || 'UN').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  
  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(fb);
  }, [fb, onSelect]);

  const toggleAccordion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-[1.5rem] border border-orange-50 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Collapsed Header */}
      <div 
        onClick={toggleAccordion}
        className="p-6 cursor-pointer hover:bg-stone-50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-orange-100 text-orange-600">
              {initials}
            </div>
            <div>
              <p className="font-bold text-stone-800 text-base">{fb.fullName}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">{fb.timestamp}</span>
                <span className="text-stone-300">•</span>
                <div className="flex gap-0.5 text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < (fb.service || 0) ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={toggleAccordion}
              className="p-2 hover:bg-orange-100 text-orange-600 rounded-xl transition-all"
            >
              <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <Filter size={18} />
              </div>
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-stone-600 line-clamp-2 italic border-l-2 border-orange-200 pl-3">
          "{fb.experience}"
        </p>

        <div className="mt-4 flex gap-2">
          <button 
            className="flex-1 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold rounded-xl transition-all text-xs border border-stone-100"
            onClick={handleSelect}
          >
            Full Screen View
          </button>
          {fb.phone && (fb.service <= 3 || fb.foodQuality <= 3) && (
            <a
              href={`https://wa.me/${String(fb.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${fb.fullName}, this is The Gentle Host. We received your feedback and noticed your experience wasn't perfect. We'd love to learn more and make it right!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); showToast('Opening WhatsApp recovery...', 'info'); }}
              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all text-xs shadow-sm"
            >
              Recover
            </a>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-stone-50 overflow-hidden"
          >
            <div className="p-6 bg-stone-50/50 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ratings Column */}
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Detailed Ratings</h4>
                  <div className="space-y-2.5">
                    <RatingRow label="Cat Interaction" score={fb.service} />
                    <RatingRow label="Food Quality" score={fb.foodQuality} />
                    <RatingRow label="Beverage Quality" score={fb.beverageQuality} />
                    <RatingRow label="Atmosphere" score={fb.atmosphere} />
                    <RatingRow label="Value for Money" score={fb.valueForMoney} />
                    <RatingRow label="Cleanliness" score={fb.cleanliness} />
                    <RatingRow label="Staff Friendliness" score={fb.staffFriendliness} />
                  </div>
                </div>

                {/* Profile Column */}
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Customer Profile</h4>
                  <div className="space-y-3 text-xs text-stone-600">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-stone-50 rounded-md text-stone-400"><Mail size={12}/></div>
                      <span className="font-medium text-stone-800 break-all">{fb.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-stone-50 rounded-md text-stone-400"><Phone size={12}/></div>
                      <span className="font-medium text-stone-800">{fb.phone || 'N/A'}</span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">Visited Before</span>
                        <span className="font-bold text-stone-800">{fb.visitedBefore || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">Frequency</span>
                        <span className="font-bold text-stone-800">{fb.visitFrequency || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">Source</span>
                        <span className="font-bold text-stone-800">
                          {fb.source || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {(fb.interests || 'Visiting').split(',').map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500 rounded-lg">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks, satisfactionThreshold }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [interestFilter, setInterestFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  
  // Defer search to keep typing smooth
  const deferredQuery = useDeferredValue(searchQuery);

  const uniqueInterests = useMemo(() => {
    const tags = new Set<string>();
    feedbacks.forEach(fb => {
      if (fb.interests) {
        fb.interests.split(',').forEach(tag => tags.add(tag.trim()));
      }
    });
    return Array.from(tags).filter(Boolean).sort();
  }, [feedbacks]);

  // Pre-calculate averages ONCE per record, rather than inside the sort loop
  const feedbacksWithAvg = useMemo(() => {
    return feedbacks.map(fb => {
      const scores = [fb.service, fb.foodQuality, fb.beverageQuality, fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness]
        .map(s => parseFloat(s as unknown as string)).filter(s => !isNaN(s));
      const avg = scores.length > 0 ? scores.reduce((sum, val) => sum + val, 0) / scores.length : 0;
      return { fb, avg, timestampMs: new Date(fb.timestamp).getTime() };
    });
  }, [feedbacks]);

  // Filter and Sort Pipeline
  const processedFeedbacks = useMemo(() => {
    let result = [...feedbacksWithAvg];

    // 1. Tab Filtering
    if (activeTab === 'attention') {
      result = result.filter(x => x.avg <= 3.0);
    } else if (activeTab === 'best') {
      result = result.filter(x => x.avg >= 4.5);
    }

    // 2. Date Range Filtering
    if (dateRange !== 'all') {
      const now = new Date().getTime();
      const ranges = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        quarter: 90 * 24 * 60 * 60 * 1000,
      };
      result = result.filter(x => (now - x.timestampMs) <= ranges[dateRange as keyof typeof ranges]);
    }

    // 3. Search (uses deferred value)
    if (deferredQuery.trim()) {
      const q = deferredQuery.toLowerCase();
      result = result.filter(({ fb }) => 
        fb.fullName?.toLowerCase().includes(q) || 
        fb.email?.toLowerCase().includes(q)
      );
    }

    // 4. Filter by Interest
    if (interestFilter !== 'all') {
      result = result.filter(({ fb }) => 
        fb.interests?.toLowerCase().includes(interestFilter.toLowerCase())
      );
    }

    // 5. Sort using precomputed values
    result.sort((a, b) => {
      if (sortOrder === 'rating_high') return b.avg - a.avg;
      if (sortOrder === 'rating_low') return a.avg - b.avg;
      if (sortOrder === 'newest') return b.timestampMs - a.timestampMs;
      if (sortOrder === 'oldest') return a.timestampMs - b.timestampMs;
      return 0;
    });

    return result.map(x => x.fb);
  }, [feedbacksWithAvg, deferredQuery, sortOrder, interestFilter, activeTab, dateRange]);

  // Pagination Logic
  const totalPages = Math.ceil(processedFeedbacks.length / ITEMS_PER_PAGE);
  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedFeedbacks.slice(start, start + ITEMS_PER_PAGE);
  }, [processedFeedbacks, currentPage]);

  // Handlers to reset page when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as any;
    setDateRange(val);
    setCurrentPage(1);
    showToast(`Filter: ${val === 'all' ? 'All Time' : val.charAt(0).toUpperCase() + val.slice(1)} applied`, 'info');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterestFilter(e.target.value);
    setCurrentPage(1);
    showToast(`Filtering by ${e.target.value}`, 'info');
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as any);
    setCurrentPage(1);
    showToast(`Sorting by ${e.target.value.replace('_', ' ')}`, 'info');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setInterestFilter('all');
    setSortOrder('newest');
    setActiveTab('all');
    setDateRange('all');
    setCurrentPage(1);
    showToast('All filters reset', 'info');
  };

  // Check if we are currently searching (to show skeleton/loader)
  const isSearching = searchQuery !== deferredQuery;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
          <MessageSquare size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Feedback Repository</h2>
          <p className="text-sm text-stone-500 font-medium">
            Browse and manage customer responses.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 bg-stone-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => { setActiveTab('all'); setCurrentPage(1); showToast('Viewing All Feedback', 'info'); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          All Feedback
        </button>
        <button
          onClick={() => { setActiveTab('attention'); setCurrentPage(1); showToast('Viewing Feedback Needing Attention', 'warning'); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'attention' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <AlertCircle size={16} /> Needs Attention
        </button>
        <button
          onClick={() => { setActiveTab('best'); setCurrentPage(1); showToast('Viewing Best Reviews', 'success'); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'best' ? 'bg-white text-green-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <Star size={16} /> Best Reviews
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none transition-all placeholder:text-stone-400 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={16} />
            <select 
              value={dateRange}
              onChange={handleDateChange}
              className="pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-sm appearance-none focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none transition-all cursor-pointer min-w-[150px] shadow-sm font-medium text-stone-700"
            >
              <option value="all">Any Date</option>
              <option value="week">This Week</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={16} />
            <select 
              value={interestFilter}
              onChange={handleFilterChange}
              className="pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-sm appearance-none focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none transition-all cursor-pointer min-w-[160px] shadow-sm font-medium text-stone-700"
            >
              <option value="all">All Interests</option>
              {uniqueInterests.map(interest => (
                <option key={interest} value={interest}>{interest}</option>
              ))}
            </select>
          </div>
          <div className="relative group">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={16} />
            <select 
              value={sortOrder}
              onChange={handleSortChange}
              className="pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-sm appearance-none focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none transition-all cursor-pointer min-w-[160px] shadow-sm font-medium text-stone-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100"
            >
              <Loader2 className="animate-spin mb-4 text-orange-500" size={32} />
              <p className="font-bold text-stone-800">Searching records...</p>
            </motion.div>
          ) : paginatedFeedbacks.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 px-8 text-center bg-white rounded-[2.5rem] border border-orange-50 shadow-sm"
            >
              <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-8 text-orange-200">
                <Search size={64} />
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-3 tracking-tight">No Matching Results</h3>
              <p className="text-stone-500 max-w-sm mb-10 leading-relaxed">
                We couldn't find any feedback entries matching your current filters. Try adjusting your search or resetting the view.
              </p>
              <button
                onClick={clearFilters}
                className="px-10 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 hover:-translate-y-1 active:translate-y-0"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {paginatedFeedbacks.map((fb) => {
                const stableKey = `${fb.timestamp}-${fb.email || fb.phone || fb.fullName}`;
                return (
                  <FeedbackCard 
                    key={stableKey} 
                    fb={fb} 
                    onSelect={setSelectedFeedback} 
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !isSearching && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 gap-4">
          <p className="text-sm text-stone-500 font-bold">
            Showing <span className="text-stone-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="text-stone-800">{Math.min(currentPage * ITEMS_PER_PAGE, processedFeedbacks.length)}</span> of <span className="text-stone-800">{processedFeedbacks.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3 rounded-xl text-stone-600 hover:bg-stone-50 disabled:opacity-20 transition-all border border-transparent hover:border-stone-100"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                        currentPage === pageNum 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                          : 'text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="text-stone-300 font-black px-1">···</span>;
                }
                return null;
              })}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3 rounded-xl text-stone-600 hover:bg-stone-50 disabled:opacity-20 transition-all border border-transparent hover:border-stone-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Lazy Loaded Modal */}
      <Suspense fallback={null}>
        {selectedFeedback && (
          <FeedbackModal 
            feedback={selectedFeedback} 
            onClose={() => setSelectedFeedback(null)} 
            satisfactionThreshold={satisfactionThreshold} 
          />
        )}
      </Suspense>
    </div>
  );
};
