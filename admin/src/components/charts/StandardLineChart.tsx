import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: any[];
  dataKey: string;
  nameKey: string;
  strokeColor?: string;
}

export const StandardLineChart: React.FC<Props> = ({ data, dataKey, nameKey, strokeColor = '#f6a04d' }) => {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-stone-400 font-medium bg-stone-50 rounded-xl border border-dashed border-stone-200">No data available</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
          <XAxis 
            dataKey={nameKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#78716c' }}
            interval={Math.max(0, Math.floor(data.length / 7) - 1)}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ stroke: '#f5f5f4', strokeWidth: 2 }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            isAnimationActive={false}
            connectNulls={true}
            type="linear" 
            dataKey={dataKey} 
            stroke={strokeColor} 
            strokeWidth={4} 
            dot={data.length > 35 ? false : { r: 4, fill: strokeColor, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: strokeColor, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
