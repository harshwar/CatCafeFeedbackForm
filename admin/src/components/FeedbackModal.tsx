import React from 'react';
import type { FeedbackEntry } from '../types';
import { X, Calendar, MapPin, Mail, Phone, Info } from 'lucide-react';
import { useToast } from './Toast';

interface FeedbackModalProps {
 feedback: FeedbackEntry | null;
 onClose: () => void;
 satisfactionThreshold: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedback, onClose, satisfactionThreshold }) => {
  const { showToast } = useToast();
  if (!feedback) return null;

 const scores = [
 { label: 'Service', value: feedback.service },
 { label: 'Food Quality', value: feedback.foodQuality },
 { label: 'Beverage Quality', value: feedback.beverageQuality },
 { label: 'Atmosphere', value: feedback.atmosphere },
 { label: 'Value for Money', value: feedback.valueForMoney },
 { label: 'Cleanliness', value: feedback.cleanliness },
 { label: 'Staff Friendliness', value: feedback.staffFriendliness },
 ];
 const avgRating = scores.reduce((a, b) => a + (Number(b.value) || 0), 0) / scores.length;
 const isSatisfied = avgRating >= satisfactionThreshold;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
 <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-stone-100 p-6 flex items-center justify-between z-10">
 <div>
 <h2 className="text-2xl font-bold text-on-surface">{feedback.fullName || 'Anonymous'}</h2>
 <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
 <Calendar size={14} />
 <span>{feedback.timestamp}</span>
 </div>
 </div>
  <div className="flex items-center gap-3">
    {feedback.phone && (avgRating <= 3.5) && (
      <a
        href={`https://wa.me/${String(feedback.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${feedback.fullName}, this is The Gentle Host. We received your feedback and noticed your experience wasn't perfect. We'd love to learn more and make it right!`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => showToast('Opening WhatsApp recovery...', 'info')}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-green-100"
      >
        Recover Customer
      </a>
    )}
    <button 
      onClick={onClose}
      className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
    >
      <X size={20} className="text-stone-600" />
    </button>
  </div>
 </div>

 <div className="p-6 space-y-8">
 {/* Customer Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex items-center gap-3 text-stone-600">
 <Mail size={18} className="text-stone-400" />
 <span>{feedback.email || 'No email provided'}</span>
 </div>
 <div className="flex items-center gap-3 text-stone-600">
 <Phone size={18} className="text-stone-400" />
 <span>{feedback.phone || 'No phone provided'}</span>
 </div>
 <div className="flex items-center gap-3 text-stone-600">
 <MapPin size={18} className="text-stone-400" />
 <span>{feedback.residence || 'No location provided'}</span>
 </div>
 <div className="flex items-center gap-3 text-stone-600">
 <Info size={18} className="text-stone-400" />
 <span>Source: {feedback.source === 'Other' ? feedback.otherSource : feedback.source}</span>
 </div>
 </div>

 {/* Experience */}
 <div>
 <h3 className="text-lg font-bold text-on-surface mb-3">Written Experience</h3>
 <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50">
 <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">
 {feedback.experience || <span className="italic text-stone-400">No written feedback provided.</span>}
 </p>
 </div>
 </div>

 {/* Ratings Grid */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-on-surface">Detailed Ratings</h3>
 <div className={`px-3 py-1 rounded-full text-xs font-bold ${isSatisfied ? 'bg-green-100 text-green-700 ' : 'bg-red-100 text-red-700 '}`}>
 Avg: {avgRating.toFixed(1)} / 5.0
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
 {scores.map(s => (
 <div key={s.label} className="flex justify-between items-center pb-2 border-b border-stone-50">
 <span className="text-sm text-stone-500">{s.label}</span>
 <div className="flex items-center gap-2">
 <span className="font-bold text-on-surface">{s.value}</span>
 <span className="text-xs text-stone-300">/ 5</span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Metadata */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
 <div>
 <span className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">Interests</span>
 <div className="flex flex-wrap gap-2">
 {feedback.interests ? feedback.interests.split(',').map(i => i.trim()).map(interest => (
 <span key={interest} className="px-2 py-1 bg-stone-100 rounded-md text-xs text-stone-600 font-medium">
 {interest}
 </span>
 )) : <span className="text-sm text-stone-400">None selected</span>}
 </div>
 </div>
 <div>
 <span className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">Visit History</span>
 <div className="text-sm text-stone-600">
 <span className="font-medium">Visited Before:</span> {feedback.visitedBefore || 'Unknown'}<br />
 {feedback.visitedBefore?.toLowerCase() === 'yes' && (
 <><span className="font-medium">Frequency:</span> {feedback.visitFrequency || 'Unknown'}</>
 )}
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
};
