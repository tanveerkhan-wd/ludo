'use client';

import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { Users, IndianRupee } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ReferrerEntry } from './mockData';

interface Props {
  data?: ReferrerEntry[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl min-w-[160px]">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">{entry.name}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-gray-400 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Referrals
          </span>
          <span className="text-white font-bold">{entry.referrals}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-gray-400 flex items-center gap-1.5">
            <IndianRupee className="w-3 h-3" /> Earnings
          </span>
          <span className="text-green-400 font-bold">₹{entry.earnings.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default function TopReferrersChart({ data, loading }: Props) {
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

  const sorted = data ? [...data].sort((a, b) => b.referrals - a.referrals) : [];

  return (
    <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5 hover:border-purple-500/20 transition-all duration-500 group">
      <CardHeader className="px-8 py-6 flex flex-row items-center justify-between border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Top Referrers</CardTitle>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] mt-0.5">
              Leaderboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">
            Top {sorted.length} Players
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={20}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#d1d5db', fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <defs>
              <linearGradient id="referralsBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="referrals"
              name="Referrals"
              fill="url(#referralsBarGradient)"
              radius={[0, 6, 6, 0]}
              label={{
                position: 'right',
                fill: '#9ca3af',
                fontSize: 10,
                fontWeight: 600,
                formatter: (v: number) => `${v}`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
