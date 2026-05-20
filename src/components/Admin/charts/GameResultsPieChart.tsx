'use client';

import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { Trophy } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { GameResultSlice } from './mockData';

interface Props {
  data?: GameResultSlice[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 text-sm">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <span className="text-gray-400">{entry.name}:</span>
        <span className="text-white font-bold">{entry.value}%</span>
      </div>
    </div>
  );
};

const renderCustomLabel = ({ name, percent }: any) => {
  return `${(percent * 100).toFixed(0)}%`;
};

export default function GameResultsPieChart({ data, loading }: Props) {
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

  const total = data?.reduce((s, d) => s + d.value, 0) ?? 100;

  return (
    <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5 hover:border-purple-500/20 transition-all duration-500 group">
      <CardHeader className="px-8 py-6 flex flex-row items-center justify-between border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/10">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Game Results</CardTitle>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] mt-0.5">
              Distribution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
            {data?.[0]?.value ?? 0}% Win Rate
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-8">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={renderCustomLabel}
              labelLine={false}
            >
              {data?.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => {
                const entry = data?.find(d => d.name === value);
                return `${value} (${entry?.value ?? 0}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
