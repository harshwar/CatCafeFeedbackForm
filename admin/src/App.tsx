import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { BackgroundPaws } from './components/BackgroundPaws';
import { Dashboard } from './Dashboard';
import type { InsightsData } from './types';
import { FeedbackList } from './FeedbackList';
import { CustomerInsights } from './CustomerInsights';
import { Reports } from './Reports';
import { NotificationPanel } from './components/NotificationPanel';
import { Bell, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { DashboardSkeleton } from './components/SkeletonLoader';
import { MobileNav } from './components/MobileNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const POLL_INTERVAL_MS = 30_000; // auto-refresh every 30 seconds

function useTimeAgo(date: Date | null): string {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!date) return;
    const update = () => {
      const secs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (secs < 10) setLabel('just now');
      else if (secs < 60) setLabel(`${secs}s ago`);
      else setLabel(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, [date]);
  return label;
}

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [lastVisit, setLastVisit] = useState<Date | null>(() => {
    const saved = localStorage.getItem('last_visit_timestamp');
    return saved ? new Date(saved) : null;
  });

  // Track user visits for notifications
  useEffect(() => {
    // Set initial last visit if empty
    if (!lastVisit) {
      const now = new Date();
      setLastVisit(now);
      localStorage.setItem('last_visit_timestamp', now.toISOString());
    }
  }, [lastVisit]);

  // When notifications are opened, update last visit to clear "new" badges
  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      const now = new Date();
      setLastVisit(now);
      localStorage.setItem('last_visit_timestamp', now.toISOString());
    }
  };

  const fetchInsights = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    fetch(`${API_URL}/api/insights`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setInsights(data);
        setLastUpdated(new Date());
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        if (!silent) { setError(err.message); setLoading(false); }
      });
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchInsights(false);
    pollRef.current = setInterval(() => fetchInsights(true), POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchInsights]);

  const timeAgo = useTimeAgo(lastUpdated);

  // Compute unread badges (Memoized)
  const feedbacks = insights?.allFeedback || [];
  const { newSubmissions, needsAttention } = useMemo(() => {
    if (!feedbacks.length) return { newSubmissions: 0, needsAttention: 0 };
    
    const newCount = lastVisit ? feedbacks.filter(fb => new Date(fb.timestamp) > lastVisit).length : 0;
    const attentionCount = feedbacks.filter(fb => {
      const scores = [fb.service, fb.foodQuality, fb.beverageQuality, fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness];
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg <= 3.0;
    }).length;
    
    return { newSubmissions: newCount, needsAttention: attentionCount };
  }, [feedbacks, lastVisit]);

  const unreadCount = newSubmissions + needsAttention;

  return (
    <div className="min-h-screen text-[#1d1b19] font-sans antialiased relative">
      <BackgroundPaws />
      {/* TopAppBar — fixed to top */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-3 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-orange-600 tracking-tight">Cat Cafe Feedback Report</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Last updated indicator */}
          {lastUpdated && !loading && (
            <span className="hidden lg:flex items-center gap-1.5 text-xs text-stone-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Updated {timeAgo}
            </span>
          )}
          <button
            onClick={() => fetchInsights(false)}
            title="Refresh data"
            className={`p-2 text-stone-500 hover:bg-orange-50 rounded-full transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative">
            <button 
              onClick={handleToggleNotifications}
              className="p-2 text-stone-500 hover:bg-orange-50 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <NotificationPanel 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
              feedbacks={feedbacks} 
              lastVisit={lastVisit}
              alertThreshold={3.0}
            />
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-orange-200 ml-2">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100"
              alt="Admin Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-[64px]">

        {/* Sidebar — always visible */}
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        {/* Main Content */}
        <main className="lg:pl-64 w-full pb-20 lg:pb-0">
          <div className="p-8 max-w-7xl mx-auto">
            {loading && !insights ? (
              <DashboardSkeleton />
            ) : error && !insights ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
                <AlertTriangle size={48} className="mb-4 text-orange-400" />
                <p className="font-bold text-stone-700 text-lg mb-2">Could not connect to the backend</p>
                <p className="text-sm text-stone-500 mb-6 max-w-sm text-center">{error}</p>
                <button
                  onClick={() => fetchInsights(false)}
                  className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                >
                  <RefreshCw size={16} /> Try Again
                </button>
              </div>
            ) : (
              <>
                {currentView === 'dashboard' && (
                  <Dashboard insights={insights} onNavigate={setCurrentView} />
                )}
                {currentView === 'feedback' && (
                  <FeedbackList feedbacks={feedbacks} satisfactionThreshold={4.0} />
                )}
                {currentView === 'insights' && (
                  <CustomerInsights feedbacks={insights?.allFeedback || []} />
                )}
                {currentView === 'reports' && (
                  <Reports feedbacks={feedbacks} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  )
}

export default App
