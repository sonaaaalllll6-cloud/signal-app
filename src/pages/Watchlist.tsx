import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { BackButton } from '@/components/BackButton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Trash2, Heart } from 'lucide-react';
import { useToastNotify } from '@/components/Toast';

interface WatchlistRow {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image_url: string | null;
    badge: 'trending' | 'rising' | 'popular' | null;
    demand_score: number;
  };
}

export default function Watchlist() {
  const { user } = useAuth();
  const [rows, setRows] = useState<WatchlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const notify = useToastNotify();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('watchlist')
        .select('id, product_id, products(id, name, brand, price, image_url, badge, demand_score)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRows(
        ((data ?? []) as unknown as WatchlistRow[]).filter((r) => r.products)
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleRemove = async (rowId: string) => {
    setRemoving((prev) => new Set(prev).add(rowId));
    await supabase.from('watchlist').delete().eq('id', rowId);
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    notify('Removed from watchlist');
    setRemoving((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>My Watchlist — Signal</title>
        <meta name="description" content="Products you're watching on Signal." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <BackButton />
          <h1 className="font-serif text-3xl text-foreground mb-8">Your Watchlist</h1>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold text-lg">Your watchlist is empty</p>
              <p className="text-muted-foreground text-sm mt-1">Browse products to save items you love.</p>
              <Link
                to="/products"
                className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {rows.map((row) => {
                const p = row.products;
                return (
                  <div key={row.id} className="relative group">
                    <ProductCard
                      id={p.id}
                      name={p.name}
                      brand={p.brand}
                      price={p.price}
                      imageUrl={p.image_url}
                      badge={p.badge}
                      demandScore={p.demand_score}
                    />
                    <button
                      onClick={() => handleRemove(row.id)}
                      disabled={removing.has(row.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      aria-label="Remove from watchlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
