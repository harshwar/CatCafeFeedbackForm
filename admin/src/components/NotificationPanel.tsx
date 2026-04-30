import React from 'react';
import type { FeedbackEntry } from '../types';
import { AlertTriangle, Clock, X } from 'lucide-react';

interface NotificationPanelProps {
 isOpen: boolean;
 onClose: () => void;
 feedbacks: FeedbackEntry[];
 lastVisit: Date | null;
 alertThreshold: number;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, feedbacks, lastVisit, alertThreshold }) => {
 if (!isOpen) return null;

 const newSubmissions = lastVisit 
 ? feedbacks.filter(fb => new Date(fb.timestamp) > lastVisit)
 : [];

 const needsAttention = feedbacks.filter(fb => {
 const scores = [fb.service, fb.foodQuality, fb.beverageQuality, fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness];
 const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
 return avg <= alertThreshold;
 });

 return (
 <div className="absolute top-16 right-6 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">
 <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
 <h3 className="font-bold text-on-surface">Notifications</h3>
 <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
 <X size={16} />
 </button>
 </div>
 <div className="max-h-96 overflow-y-auto">
 {newSubmissions.length === 0 && needsAttention.length === 0 && (
 <div className="p-8 text-center text-stone-500">
 <p>You're all caught up!</p>
 </div>
 )}

 {newSubmissions.length > 0 && (
 <div className="p-4 border-b border-stone-100">
 <div className="flex items-center gap-2 text-green-600 mb-2">
 <Clock size={16} />
 <span className="font-semibold text-sm">New Submissions</span>
 </div>
 <p className="text-sm text-stone-600">
 {newSubmissions.length} new feedback(s) received since your last visit.
 </p>
 </div>
 )}

 {needsAttention.length > 0 && (
 <div className="p-4">
 <div className="flex items-center gap-2 text-red-500 mb-2">
 <AlertTriangle size={16} />
 <span className="font-semibold text-sm">Needs Attention</span>
 </div>
 <p className="text-sm text-stone-600 mb-2">
 {needsAttention.length} feedback(s) have an average rating of {alertThreshold} or below.
 </p>
 <div className="space-y-2">
 {needsAttention.slice(0, 3).map((fb, idx) => (
 <div key={idx} className="bg-red-50 p-2 rounded-lg text-xs">
 <span className="font-semibold text-red-700">{fb.fullName}</span>:"{fb.experience.slice(0, 40)}..."
 </div>
 ))}
 {needsAttention.length > 3 && (
 <p className="text-xs text-stone-400 text-center">+{needsAttention.length - 3} more</p>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
};
