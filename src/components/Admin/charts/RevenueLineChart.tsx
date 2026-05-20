'use client';

import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { TrendingUp, IndianRupee } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RevenueDataPoint } from './mockData';

interface Props {
  data?: RevenueDataPoint[];
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
          <span className="text-white font-bold">
            {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const gradientDefs = (
  <defs>
    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="battlesGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
    </linearGradient>
  </defs>
);

export default function RevenueLineChart({ data, loading }: Props) {
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

  const stats = data?.length
    ? {
        total: data.reduce((s, d) => s + d.revenue, 0),
        avg: Math.round(data.reduce((s, d) => s + d.revenue, 0) / data.length),
        best: Math.max(...data.map(d => d.revenue)),
      }
    : null;

  return (
    <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5 hover:border-purple-500/20 transition-all duration-500 group">
      <CardHeader className="px-8 py-6 flex flex-row items-center justify-between border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Revenue Trend</CardTitle>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] mt-0.5">
              Last 30 Days
            </p>
          </div>
        </div>
        {stats && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest">Total</p>
              <p className="text-sm font-bold text-purple-400">₹{stats.total.toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="text-right">
              <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest">Daily Avg</p>
              <p className="text-sm font-bold text-blue-400">₹{stats.avg.toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            {gradientDefs}
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#ffffff0a' }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="revenue"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="battles"
              orientation="right"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#a855f7"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#a855f7', stroke: '#1a1a1a', strokeWidth: 2 }}
              fill="url(#revenueGradient)"
            />
            <Line
              yAxisId="battles"
              type="monotone"
              dataKey="battles"
              name="Battles"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1a1a1a', strokeWidth: 2 }}
              fill="url(#battlesGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
