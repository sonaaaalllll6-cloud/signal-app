import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { BackButton } from '@/components/BackButton';
import BuyButton from '@/components/BuyButton';
import WatchButton from '@/components/WatchButton';
import { formatPrice } from '@/utils';
import { Eye, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function DemandBadge({ badge }: { badge: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    trending: { bg: 'bg-red-100', text: 'text-red-800', label: 'Trending' },
    rising: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Rising' },
    popular: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Popular' },
  };
  const c = config[badge];
  if (!c) return null;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 ${c.bg} ${c.text}`}>
      <TrendingUp className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function DemandGauge({ score }: { score: number }) {
  const capped = Math.min(100, Math.max(0, score));
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Demand</span>
        <span className="tabular-nums">{capped}/100</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${capped}%` }} />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [clicks24h, setClicks24h] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [related, setRelated] = useState<Record<string, unknown>[]>([]);
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const { data: p, error: pErr } = await supabase.from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at').eq('id', id).single();
      if (pErr && pErr.code !== 'PGRST116') throw pErr;
      setProduct(p ?? null);

      if (p) {
        const dayAgo = new Date(Date.now() - 86400000).toISOString();
        const [{ count: c }, { count: w }, { data: rel }] = await Promise.all([
          supabase.from('clicks').select('id', { count: 'exact', head: true }).eq('product_id', id).gte('created_at', dayAgo),
          supabase.from('watchlist').select('id', { count: 'exact', head: true }).eq('product_id', id),
          supabase.from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at').eq('category', p.category as string).neq('id', id)
            .is('deleted_at', null).order('demand_score', { ascending: false }).limit(4),
        ]);
        setClicks24h(c || 0);
        setWatchCount(w || 0);
        setRelated((rel as Record<string, unknown>[]) || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
      setProduct(null);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Loading skeleton
  if (product === undefined && !error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-5 bg-secondary rounded w-16" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 aspect-square bg-secondary rounded-xl" />
              <div className="lg:col-span-2 space-y-4">
                <div className="h-3 bg-secondary rounded w-24" />
                <div className="h-8 bg-secondary rounded w-3/4" />
                <div className="h-7 bg-secondary rounded w-1/3" />
                <div className="h-20 bg-secondary rounded" />
                <div className="h-12 bg-secondary rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
          <AlertCircle size={40} className="text-destructive" />
          <h1 className="font-serif text-2xl text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button onClick={load} className="mt-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found
  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
          <h1 className="font-serif text-2xl text-foreground">Product not found</h1>
          <p className="text-muted-foreground text-sm">This product may have been removed or the link is incorrect.</p>
          <button onClick={() => navigate(-1)} className="mt-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors min-h-[44px]">
            ← Go back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = product.image_url as string | null;

  return (
    <>
      <Helmet>
        <title>{product.name as string} — Signal</title>
        <meta name="description" content={(product.description as string) || `${product.name} by ${product.brand} on Signal`} />
        <meta property="og:title" content={`${product.name} by ${product.brand}`} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <BackButton />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-4">
            {/* Image — full width mobile, left col desktop */}
            <div className="lg:col-span-3">
              {imageUrl && !imgError ? (
                <img
                  src={imageUrl}
                  alt={product.name as string}
                  className="w-full rounded-xl object-cover aspect-square sm:aspect-auto"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full aspect-square bg-secondary rounded-xl flex items-center justify-center text-muted-foreground">
                  <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">{product.brand as string}</p>
              <h1 className="font-serif text-3xl font-bold text-foreground leading-tight">{product.name as string}</h1>
              <p className="text-2xl font-bold text-foreground tabular-nums">{formatPrice(Number(product.price))}</p>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description as string}</p>
              )}

              {/* Demand Signals */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {product.badge && <DemandBadge badge={product.badge as string} />}
                  <DemandGauge score={Number(product.demand_score ?? 0)} />
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span className="tabular-nums">{clicks24h}</span>&nbsp;clicks in the last 24 hours
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className="tabular-nums">{watchCount}</span>&nbsp;people watching this
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-1">
                <BuyButton productId={product.id as string} />
                <WatchButton productId={product.id as string} />
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-2xl text-foreground mb-6">More Like This</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {related.map((p) => (
                  <ProductCard
                    key={p.id as string}
                    id={p.id as string}
                    name={p.name as string}
                    brand={p.brand as string}
                    price={Number(p.price)}
                    imageUrl={p.image_url as string | null}
                    badge={p.badge as 'trending' | 'rising' | 'popular' | null}
                    demandScore={Number(p.demand_score ?? 0)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
