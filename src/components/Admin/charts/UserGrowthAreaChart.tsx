'use client';

import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { Users } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { UserGrowthPoint } from './mockData';

interface Props {
  data?: UserGrowthPoint[];
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
          <span className="text-white font-bold">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function UserGrowthAreaChart({ data, loading }: Props) {
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

  const totalNew = data?.reduce((s, d) => s + d.newUsers, 0) ?? 0;
  const lastTotal = data?.[data.length - 1]?.totalUsers ?? 0;

  return (
    <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5 hover:border-purple-500/20 transition-all duration-500 group">
      <CardHeader className="px-8 py-6 flex flex-row items-center justify-between border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">User Growth</CardTitle>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] mt-0.5">
              Registrations Over Time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest">New (30d)</p>
            <p className="text-sm font-bold text-green-400">+{totalNew.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="text-right">
            <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest">Total</p>
            <p className="text-sm font-bold text-cyan-400">{lastTotal.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-8">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="newUsersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="totalUsersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#ffffff0a' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="totalUsers"
              name="Total Users"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#totalUsersGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#06b6d4', stroke: '#1a1a1a', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="newUsers"
              name="New Users"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#newUsersGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', stroke: '#1a1a1a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
