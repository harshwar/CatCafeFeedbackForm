import React, { useMemo } from 'react';
import type { FeedbackEntry } from './types';
import { 
  getLoyaltySplit, 
  getGeographicDistribution, 
  getInterestProfile, 
  getVIPList, 
  getNeedsAttentionList 
} from './utils/analytics';
import { StandardPieChart } from './components/charts/StandardPieChart';
import { Users, MapPin, Tag, Star, AlertCircle, Heart } from 'lucide-react';

interface Props {
  feedbacks: FeedbackEntry[];
}

export const CustomerInsights: React.FC<Props> = ({ feedbacks }) => {
  const loyaltyData = useMemo(() => getLoyaltySplit(feedbacks), [feedbacks]);
  const geoData = useMemo(() => getGeographicDistribution(feedbacks), [feedbacks]);
  const interestData = useMemo(() => getInterestProfile(feedbacks), [feedbacks]);
  const vipList = useMemo(() => getVIPList(feedbacks), [feedbacks]);
  const attentionList = useMemo(() => getNeedsAttentionList(feedbacks), [feedbacks]);

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
        <Users size={48} className="mb-4 opacity-50" />
        <p className="font-medium">No feedback available to analyze yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Users className="text-orange-600" /> Customer Insights
        </h2>
        <p className="text-stone-500 text-sm mt-1">Deep dive into visitor demographics and behaviors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loyalty Split */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-orange-500" /> Loyalty Split
          </h3>
          <div className="h-[250px]">
            <StandardPieChart data={loyaltyData} nameKey="name" dataKey="value" />
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-orange-500" /> Top Locations
          </h3>
          <div className="space-y-4 mt-6">
            {geoData.map((geo) => (
              <div key={geo.location} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">{geo.location}</span>
                <span className="font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm">
                  {geo.count} {geo.count === 1 ? 'visit' : 'visits'}
                </span>
              </div>
            ))}
            {geoData.length === 0 && <p className="text-stone-400 text-sm text-center pt-8">No location data provided.</p>}
          </div>
        </div>

        {/* Top Interests */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Tag size={18} className="text-orange-500" /> Top Interests
          </h3>
          <div className="flex flex-wrap gap-2 mt-6">
            {interestData.map((interest, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-medium text-stone-700 text-sm">{interest.name}</span>
                <span className="text-xs font-bold text-stone-400">({interest.count})</span>
              </div>
            ))}
            {interestData.length === 0 && <p className="text-stone-400 text-sm text-center w-full pt-8">No interest data provided.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VIP Super Fans */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
          <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
            <Star size={18} className="text-orange-500 fill-orange-500" /> VIP Super Fans
          </h3>
          <p className="text-xs text-stone-400 mb-6 uppercase font-bold tracking-wider">Avg rating &gt;= 4.8</p>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {vipList.map((vip, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border border-stone-100 rounded-xl hover:border-orange-200 transition-colors">
                <div>
                  <p className="font-bold text-stone-800 text-sm">{vip.fullName}</p>
                  <p className="text-xs text-stone-500">{vip.email || vip.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{vip.visitFrequency || 'Unknown frequency'}</p>
                </div>
              </div>
            ))}
            {vipList.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-sm">No VIPs found yet.</div>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50">
          <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" /> Needs Attention
          </h3>
          <p className="text-xs text-stone-400 mb-6 uppercase font-bold tracking-wider">Avg rating &lt;= 3.0</p>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {attentionList.map((attn, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border border-red-50 rounded-xl bg-red-50/30">
                <div>
                  <p className="font-bold text-stone-800 text-sm">{attn.fullName}</p>
                  <p className="text-xs text-stone-500">{attn.email || attn.phone}</p>
                </div>
                <div className="text-right max-w-[150px]">
                  <p className="text-xs text-stone-600 truncate" title={attn.experience}>"{attn.experience}"</p>
                </div>
              </div>
            ))}
            {attentionList.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-sm">No customers currently need attention. Great job!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
