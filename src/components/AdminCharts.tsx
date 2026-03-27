import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface ClicksByDate {
  date: string;
  count: number;
}

interface TopProduct {
  name: string;
  count: number;
}

interface WatchlistByDate {
  date: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Tech: '#1D4ED8',
  Accessories: '#15803D',
  Collectibles: '#B91C1C',
  'Creative Tools': '#92400E',
  Lifestyle: '#5B21B6',
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-lg p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[300px] bg-muted rounded animate-pulse" />;
}

function EmptyState() {
  return (
    <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
      No data yet
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center gap-2">
      <p className="text-sm text-muted-foreground">Failed to load</p>
      <button onClick={onRetry} className="text-sm underline text-primary hover:opacity-80">
        Retry
      </button>
    </div>
  );
}

function useChartData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetcher()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load };
}

function groupByDate(rows: Array<{ created_at: string }>, days: number): Array<{ date: string; count: number }> {
  const dateMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    dateMap.set(format(subDays(new Date(), i), 'yyyy-MM-dd'), 0);
  }
  for (const row of rows) {
    const d = format(new Date(row.created_at), 'yyyy-MM-dd');
    if (dateMap.has(d)) dateMap.set(d, (dateMap.get(d) ?? 0) + 1);
  }
  return Array.from(dateMap, ([date, count]) => ({ date: format(new Date(date), 'MMM d'), count }));
}

export default function AdminCharts() {
  return (
    <div>
      {/* Stat cards placeholder row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClicksOverTime />
        <TopProductsByClicks />
        <WatchlistActivity />
        <CategoryDistribution />
      </div>
    </div>
  );
}

function ClicksOverTime() {
  const { data, loading, error, retry } = useChartData<ClicksByDate[]>(
    useCallback(async () => {
      const since = subDays(new Date(), 14).toISOString();
      const { data, error } = await supabase
        .from('clicks')
        .select('created_at')
        .gte('created_at', since);
      if (error) throw error;
      return groupByDate(data ?? [], 14);
    }, []),
  );

  return (
    <ChartCard title="Clicks Over Time (14 days)">
      {loading ? <ChartSkeleton /> : error ? <ErrorState onRetry={retry} /> : !data?.length ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
              formatter={(value: number) => [`${value} clicks`, 'Clicks']}
            />
            <Line type="monotone" dataKey="count" stroke="#111111" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function TopProductsByClicks() {
  const { data, loading, error, retry } = useChartData<TopProduct[]>(
    useCallback(async () => {
      const { data: clicks, error: clickErr } = await supabase.from('clicks').select('product_id');
      if (clickErr) throw clickErr;

      const countMap = new Map<string, number>();
      for (const c of clicks ?? []) {
        if (c.product_id) countMap.set(c.product_id, (countMap.get(c.product_id) ?? 0) + 1);
      }

      const topIds = Array.from(countMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (topIds.length === 0) return [];

      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', topIds.map(([id]) => id));

      const nameMap = new Map((products ?? []).map((p) => [p.id, p.name]));

      return topIds.map(([id, count]) => ({
        name: (nameMap.get(id) ?? 'Unknown').slice(0, 20),
        count,
      }));
    }, []),
  );

  return (
    <ChartCard title="Top Products by Clicks">
      {loading ? <ChartSkeleton /> : error ? <ErrorState onRetry={retry} /> : !data?.length ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Bar dataKey="count" fill="#111111" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function WatchlistActivity() {
  const { data, loading, error, retry } = useChartData<WatchlistByDate[]>(
    useCallback(async () => {
      const since = subDays(new Date(), 14).toISOString();
      const { data, error } = await supabase
        .from('watchlist')
        .select('created_at')
        .gte('created_at', since);
      if (error) throw error;
      return groupByDate(data ?? [], 14);
    }, []),
  );

  return (
    <ChartCard title="Watchlist Activity (14 days)">
      {loading ? <ChartSkeleton /> : error ? <ErrorState onRetry={retry} /> : !data?.length ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Area type="monotone" dataKey="count" fill="#7C3AED" fillOpacity={0.2} stroke="#7C3AED" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function CategoryDistribution() {
  const { data, loading, error, retry } = useChartData<CategoryCount[]>(
    useCallback(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .is('deleted_at', null);
      if (error) throw error;

      const countMap = new Map<string, number>();
      for (const row of data ?? []) {
        const cat = row.category ?? 'Other';
        countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
      }
      return Array.from(countMap, ([category, count]) => ({ category, count }));
    }, []),
  );

  return (
    <ChartCard title="Category Distribution">
      {loading ? <ChartSkeleton /> : error ? <ErrorState onRetry={retry} /> : !data?.length ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="category" cx="50%" cy="45%" outerRadius={90} label={({ category }) => category}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? '#6B7280'} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              formatter={(value: string) => {
                const item = data.find((d) => d.category === value);
                return `${value} (${item?.count ?? 0})`;
              }}
            />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
