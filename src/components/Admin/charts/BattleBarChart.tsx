'use client';

import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { Swords } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BattleStatPoint } from './mockData';

interface Props {
  data?: BattleStatPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="text-white font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function BattleBarChart({ data, loading }: Props) {
  if (loading) {
    return (
      <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
        <CardHeader className="px-8 py-6 border-white/5">
          <Skeleton className="h-5 w-40 rounded-lg" />
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  const totalCreated = data?.reduce((s, d) => s + d.created, 0) ?? 0;
  const totalCompleted = data?.reduce((s, d) => s + d.completed, 0) ?? 0;
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;

  return (
    <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5 hover:border-purple-500/20 transition-all duration-500 group">
      <CardHeader className="px-8 py-6 flex flex-row items-center justify-between border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Battle Statistics</CardTitle>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] mt-0.5">
              Created vs Completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest">Rate</p>
            <p className="text-sm font-bold text-green-400">{completionRate}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#ffffff0a' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              iconType="rect"
              iconSize={10}
            />
            <Bar
              dataKey="created"
              name="Created"
              fill="#a855f7"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
