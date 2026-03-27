import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';

type BadgeType = 'trending' | 'rising' | 'popular' | null;

const SectionHeader = ({ title, href }: { title: string; href: string }) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="font-serif text-3xl text-foreground">{title}</h2>
    <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      View all →
    </Link>
  </div>
);

const HomePage = () => {
  const { data: productCount } = useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null);
      return count ?? 0;
    },
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at').eq('badge', 'trending').is('deleted_at', null)
        .order('demand_score', { ascending: false }).limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at').eq('is_featured', true).is('deleted_at', null).limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: rising, isLoading: risingLoading } = useQuery({
    queryKey: ['rising-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at').eq('badge', 'rising').is('deleted_at', null).limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: justAdded, isLoading: justAddedLoading } = useQuery({
    queryKey: ['just-added'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at').is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(12);
      if (error) throw error;
      return data;
    },
  });

  // Only show sections that have (or are loading) data
  const hasFeatured = featuredLoading || (featured && featured.length > 0);
  const hasRising = risingLoading || (rising && rising.length > 0);

  return (
    <>
      <Helmet>
        <title>Signal — Curated Product Discovery</title>
        <meta name="description" content="Discover trending products across fashion, tech, beauty and lifestyle. Curated by demand signals." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Hero — Section 5A */}
        <section className="relative bg-background py-20 sm:py-28 lg:py-36 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Discover What the Internet Is Buying Next
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl mt-6 max-w-xl mx-auto">
              Curated products. Real demand signals. Editorial drops — updated daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                to="/products"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center"
              >
                Browse Products
              </Link>
              <Link
                to="/advertise"
                className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors min-h-[44px] flex items-center justify-center"
              >
                For Brands
              </Link>
            </div>

            {/* Stats bar — Section 5B */}
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground flex-wrap">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-foreground tabular-nums font-serif">
                  {productCount != null ? productCount.toLocaleString() : '—'}
                </span>
                <span>products curated</span>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-foreground font-serif">10</span>
                <span>drops coming soon</span>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-foreground font-serif">₹0</span>
                <span>to browse</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Trending Now */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <SectionHeader title="Trending Now" href="/products?trending=true" />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (trending && trending.length > 0)
                ? trending.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      brand={p.brand}
                      price={Number(p.price)}
                      imageUrl={p.image_url}
                      badge={p.badge as BadgeType}
                      demandScore={Number(p.demand_score ?? 0)}
                      lazyLoad={i >= 4}
                    />
                  ))
                : (
                  <p className="col-span-4 text-center text-muted-foreground py-8">No trending products yet.</p>
                )}
          </div>
        </section>

        {/* Section 2: Featured Picks — hidden if empty (Section 3B) */}
        {hasFeatured && (
          <section className="bg-secondary/30 py-16 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader title="Featured Picks" href="/products" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : featured?.map((p) => (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        brand={p.brand}
                        price={Number(p.price)}
                        imageUrl={p.image_url}
                        badge={p.badge as BadgeType}
                        demandScore={Number(p.demand_score ?? 0)}
                      />
                    ))}
              </div>
            </div>
          </section>
        )}

        {/* Section 3: Rising — hidden if empty */}
        {hasRising && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <SectionHeader title="Rising" href="/products" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {risingLoading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : rising?.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      brand={p.brand}
                      price={Number(p.price)}
                      imageUrl={p.image_url}
                      badge={p.badge as BadgeType}
                      demandScore={Number(p.demand_score ?? 0)}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Section 4: Just Added */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
          <SectionHeader title="Just Added" href="/products?sort=created_at.desc" />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {justAddedLoading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : justAdded?.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    brand={p.brand}
                    price={Number(p.price)}
                    imageUrl={p.image_url}
                    badge={p.badge as BadgeType}
                    demandScore={Number(p.demand_score ?? 0)}
                  />
                ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
