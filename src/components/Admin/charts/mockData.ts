// Mock data for admin dashboard charts
// TODO: Replace with real API calls from prisma

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  battles: number;
}

export interface BattleStatPoint {
  date: string;
  created: number;
  completed: number;
}

export interface GameResultSlice {
  name: string;
  value: number;
  color: string;
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface ReferrerEntry {
  name: string;
  referrals: number;
  earnings: number;
}

const formatDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const revenueTrend: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: formatDate(29 - i),
  revenue: Math.floor(8000 + Math.random() * 15000),
  battles: Math.floor(15 + Math.random() * 40),
}));

export const battleStats: BattleStatPoint[] = Array.from({ length: 7 }, (_, i) => ({
  date: formatDate(6 - i),
  created: Math.floor(20 + Math.random() * 30),
  completed: Math.floor(15 + Math.random() * 25),
}));

export const gameResults: GameResultSlice[] = [
  { name: 'Wins', value: 58, color: '#22c55e' },
  { name: 'Losses', value: 25, color: '#ef4444' },
  { name: 'Cancelled', value: 10, color: '#f97316' },
  { name: 'Disputed', value: 7, color: '#eab308' },
];

const rawGrowth = Array.from({ length: 30 }, (_, i) => ({
  date: formatDate(29 - i),
  newUsers: Math.floor(20 + Math.random() * 80),
}));

export const userGrowth: UserGrowthPoint[] = rawGrowth.reduce((acc, curr) => {
  const prevTotal = acc.length > 0 ? acc[acc.length - 1].totalUsers : 1200;
  acc.push({ ...curr, totalUsers: prevTotal + curr.newUsers });
  return acc;
}, [] as UserGrowthPoint[]);

export const topReferrers: ReferrerEntry[] = [
  { name: 'Rahul Sharma', referrals: 47, earnings: 14250 },
  { name: 'Priya Patel', referrals: 38, earnings: 11800 },
  { name: 'Amit Singh', referrals: 31, earnings: 9600 },
  { name: 'Sneha Reddy', referrals: 25, earnings: 8200 },
  { name: 'Vikram Joshi', referrals: 19, earnings: 6400 },
  { name: 'Ananya Gupta', referrals: 14, earnings: 4800 },
  { name: 'Rohit Verma', referrals: 10, earnings: 3500 },
  { name: 'Neha Kapoor', referrals: 7, earnings: 2100 },
];
