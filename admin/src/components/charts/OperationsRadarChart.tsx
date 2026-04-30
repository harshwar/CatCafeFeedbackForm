import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: any[];
}

export const OperationsRadarChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-[350px] flex items-center justify-center text-stone-400 font-medium bg-stone-50 rounded-xl border border-dashed border-stone-200">No data available</div>;
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid stroke="#e7e5e4" />
          <PolarAngleAxis dataKey="category" tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
          <Tooltip 
            formatter={(value: any) => [`${value} / 5.0`, 'Avg Score']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Radar name="Average Score" dataKey="score" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
