import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: any[];
  dataKey: string;
  nameKey: string;
  fillColor?: string;
  useCustomColors?: boolean;
  yAxisDomain?: [number | 'dataMin' | 'auto', number | 'dataMax' | 'auto'];
}

export const StandardBarChart: React.FC<Props> = ({ data, dataKey, nameKey, fillColor = '#f97316', useCustomColors = false, yAxisDomain }) => {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-stone-400 font-medium bg-stone-50 rounded-xl border border-dashed border-stone-200">No data available</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
          <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} domain={yAxisDomain} />
          <Tooltip 
            cursor={{ fill: '#fff7ed' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} fill={!useCustomColors ? fillColor : undefined}>
            {useCustomColors && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || fillColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
