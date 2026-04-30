import React, { useState, useMemo, useDeferredValue, Suspense, lazy, useCallback } from 'react';
import { Star, MessageSquare, Mail, Phone, MapPin, Calendar, Clock, Link as LinkIcon, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { FeedbackEntry } from './types';

// Lazy load the heavy modal to split bundle size
const FeedbackModal = lazy(() => 
  import('./components/FeedbackModal').then(module => ({ default: module.FeedbackModal }))
);

interface FeedbackListProps {
  feedbacks: FeedbackEntry[];
  satisfactionThreshold: number;
}

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

// Extracted and Memoized FeedbackCard
const FeedbackCard = React.memo(({ fb, onSelect }: { fb: FeedbackEntry, onSelect: (fb: FeedbackEntry) => void }) => {
  const initials = (fb.fullName || 'UN').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  
  // Memoize the click handler so it doesn't create a new function each render
  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(fb);
  }, [fb, onSelect]);

  return (
    <div onClick={handleSelect} className="p-6 bg-stone-50 rounded-[1.5rem] border border-transparent hover:border-orange-200 transition-all cursor-pointer">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl bg-orange-100 text-orange-600">
            {initials}
          </div>
          <div>
            <p className="font-bold text-on-surface text-lg">{fb.fullName}</p>
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">{fb.timestamp}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-stone-400 uppercase mb-1">Overall</span>
          <div className="flex gap-1 text-orange-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < (fb.service || 0) ? 'currentColor' : 'none'} />
            ))}
          </div>
        </div>
      </div>

      {/* Main Experience Text */}
      <p className="text-base text-stone-700 mb-6 italic border-l-4 border-orange-200 pl-4 py-1">
        "{fb.experience}"
      </p>

      {/* Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
        {/* Ratings Column */}
        <div>
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

        {/* Info Column */}
        <div>
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Customer Profile</h4>
          <div className="space-y-3 text-sm text-stone-600">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-stone-50 rounded-md text-stone-400"><Mail size={14}/></div>
              <span className="font-medium text-stone-800 break-all">{fb.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-stone-50 rounded-md text-stone-400"><Phone size={14}/></div>
              <span className="font-medium text-stone-800">{fb.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-stone-50 rounded-md text-stone-400"><MapPin size={14}/></div>
              <span className="font-medium text-stone-800">{fb.residence || 'N/A'}</span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs"><Calendar size={12}/> Visited Before:</span>
                <span className="font-bold text-stone-800 text-xs">{fb.visitedBefore || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs"><Clock size={12}/> Frequency:</span>
                <span className="font-bold text-stone-800 text-xs">{fb.visitFrequency || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs"><LinkIcon size={12}/> Source:</span>
                <span className="font-bold text-stone-800 text-xs text-right truncate max-w-[120px]">
                  {fb.source || 'N/A'} {fb.otherSource ? <span className="text-stone-400">({fb.otherSource})</span> : ''}
                </span>
              </div>
            </div>
          </div>
          
          {/* Interests */}
          <div className="mt-5 flex flex-wrap gap-2">
            {(fb.interests || 'Visiting').split(',').map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-orange-50 text-[10px] font-bold uppercase tracking-wider text-orange-600 rounded-lg">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <button 
        className="mt-6 w-full py-3 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold rounded-xl transition-colors text-sm"
        onClick={handleSelect}
      >
        View Full Details
      </button>
    </div>
  );
});

export const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks, satisfactionThreshold }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [interestFilter, setInterestFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
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

    // 1. Search (uses deferred value)
    if (deferredQuery.trim()) {
      const q = deferredQuery.toLowerCase();
      result = result.filter(({ fb }) => 
        fb.fullName?.toLowerCase().includes(q) || 
        fb.email?.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Interest
    if (interestFilter !== 'all') {
      result = result.filter(({ fb }) => 
        fb.interests?.toLowerCase().includes(interestFilter.toLowerCase())
      );
    }

    // 3. Sort using precomputed values
    result.sort((a, b) => {
      if (sortOrder === 'rating_high') return b.avg - a.avg;
      if (sortOrder === 'rating_low') return a.avg - b.avg;
      if (sortOrder === 'newest') return b.timestampMs - a.timestampMs;
      if (sortOrder === 'oldest') return a.timestampMs - b.timestampMs;
      return 0;
    });

    return result.map(x => x.fb);
  }, [feedbacksWithAvg, deferredQuery, sortOrder, interestFilter]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterestFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as any);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setInterestFilter('all');
    setSortOrder('newest');
    setCurrentPage(1);
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
          <h2 className="text-2xl font-bold text-stone-800">All Feedback</h2>
          <p className="text-sm text-stone-500">
            {processedFeedbacks.length} of {feedbacks.length} responses
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <select 
              value={interestFilter}
              onChange={handleFilterChange}
              className="pl-9 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all cursor-pointer min-w-[140px]"
            >
              <option value="all">All Interests</option>
              {uniqueInterests.map(interest => (
                <option key={interest} value={interest}>{interest}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <select 
              value={sortOrder}
              onChange={handleSortChange}
              className="pl-9 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all cursor-pointer min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>
          {(searchQuery || interestFilter !== 'all' || sortOrder !== 'newest') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm font-semibold text-orange-600 border border-orange-200 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50 space-y-4">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="animate-spin mb-4 text-orange-500" size={32} />
            <p className="font-medium text-stone-600">Searching feedback...</p>
          </div>
        ) : paginatedFeedbacks.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-medium">
            {feedbacks.length === 0 ? 'No feedback received yet.' : 'No matching feedback found.'}
          </div>
        ) : (
          paginatedFeedbacks.map((fb) => {
            // Stable Key ensures components aren't wrongly recycled
            const stableKey = `${fb.timestamp}-${fb.email || fb.phone || fb.fullName}`;
            return (
              <FeedbackCard 
                key={stableKey} 
                fb={fb} 
                onSelect={setSelectedFeedback} 
              />
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !isSearching && (
        <div className="flex items-center justify-between bg-white p-4 rounded-[1rem] shadow-sm border border-stone-100">
          <p className="text-sm text-stone-500 font-medium">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, processedFeedbacks.length)} of {processedFeedbacks.length}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Simple logic to show limited page numbers (could be expanded for many pages)
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-orange-500 text-white shadow-md' 
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="text-stone-400 px-1">...</span>;
                }
                return null;
              })}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
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
