import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalProducts: number;
  totalNewsletters: number;
  totalClicks: number;
  totalWatchlist: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [products, newsletters, clicks, watchlist] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('newsletters').select('id', { count: 'exact', head: true }),
        supabase.from('clicks').select('id', { count: 'exact', head: true }),
        supabase.from('watchlist').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        totalProducts: products.count ?? 0,
        totalNewsletters: newsletters.count ?? 0,
        totalClicks: clicks.count ?? 0,
        totalWatchlist: watchlist.count ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-5 animate-pulse">
            <div className="h-3 w-20 bg-muted rounded mb-3" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Products', value: stats?.totalProducts ?? 0 },
    { label: 'Newsletters', value: stats?.totalNewsletters ?? 0 },
    { label: 'Total Clicks', value: stats?.totalClicks ?? 0 },
    { label: 'Watchlist Items', value: stats?.totalWatchlist ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border rounded-lg p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
