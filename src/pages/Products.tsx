import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { BackButton } from '@/components/BackButton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, X, AlertCircle } from 'lucide-react';

const PAGE_SIZE = 24;

type SortValue = 'demand_score.desc' | 'created_at.desc' | 'price.asc' | 'price.desc';
type SidebarSort = 'trending' | 'newest' | 'price_asc' | 'price_desc';
type SidebarCategory = 'All' | 'Tech' | 'Accessories' | 'Collectibles' | 'Creative Tools' | 'Lifestyle';

const sortToSidebar = (s: string): SidebarSort =>
  s === 'created_at.desc' ? 'newest' : s === 'price.asc' ? 'price_asc' : s === 'price.desc' ? 'price_desc' : 'trending';
const sidebarToSort = (s: SidebarSort): SortValue =>
  s === 'newest' ? 'created_at.desc' : s === 'price_asc' ? 'price.asc' : s === 'price_desc' ? 'price.desc' : 'demand_score.desc';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const filters = useMemo(() => ({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('min') || '',
    maxPrice: searchParams.get('max') || '',
    trendingOnly: searchParams.get('trending') === 'true',
    sort: (searchParams.get('sort') || 'demand_score.desc') as SortValue,
  }), [searchParams]);

  const page = parseInt(searchParams.get('page') || '0', 10);

  const updateFilters = useCallback((newFilters: typeof filters) => {
    const params: Record<string, string> = {};
    if (newFilters.q) params.q = newFilters.q;
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.minPrice) params.min = newFilters.minPrice;
    if (newFilters.maxPrice) params.max = newFilters.maxPrice;
    if (newFilters.trendingOnly) params.trending = 'true';
    if (newFilters.sort && newFilters.sort !== 'demand_score.desc') params.sort = newFilters.sort;
    setSearchParams(params);
  }, [setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilters({ ...filters, q: value });
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ ...filters, q: '' });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase.from('products').select('id, name, brand, price, image_url, category, badge, demand_score, description, is_featured, is_sponsored, created_at, deleted_at', { count: 'exact' }).is('deleted_at', null);
      if (filters.q) q = q.or(`name.ilike.%${filters.q}%,brand.ilike.%${filters.q}%,category.ilike.%${filters.q}%`);
      if (filters.category) q = q.eq('category', filters.category);
      if (filters.minPrice) q = q.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) q = q.lte('price', parseFloat(filters.maxPrice));
      if (filters.trendingOnly) q = q.not('badge', 'is', null);
      const [col, dir] = filters.sort.split('.');
      q = q.order(col, { ascending: dir === 'asc' });
      q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      const { data, count: totalCount, error: err } = await q;
      if (err) throw err;
      setProducts(data || []);
      setCount(totalCount || 0);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <Helmet>
        <title>Products — Signal</title>
        <meta name="description" content="Browse 200+ curated products with trending signals across fashion, tech, beauty and lifestyle." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <BackButton />
          <h1 className="font-serif text-3xl text-foreground mb-6 mt-2">All Products</h1>

          {/* Search Bar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-xl">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground min-h-[44px]"
              />
              {searchInput && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-8 items-start">
            <FilterSidebar
              filters={{
                category: (filters.category || 'All') as SidebarCategory,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                trendingOnly: filters.trendingOnly,
                sort: sortToSidebar(filters.sort),
              }}
              onChange={(f) => updateFilters({
                q: filters.q,
                category: f.category === 'All' ? '' : f.category,
                minPrice: f.minPrice,
                maxPrice: f.maxPrice,
                trendingOnly: f.trendingOnly,
                sort: sidebarToSort(f.sort),
              })}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-6 tabular-nums">
                {filters.q
                  ? `${count} result${count !== 1 ? 's' : ''} for "${filters.q}"`
                  : `${count} product${count !== 1 ? 's' : ''} found`}
              </p>

              {/* Error state — 3C */}
              {error && (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <AlertCircle size={40} className="text-destructive" />
                  <p className="text-foreground font-semibold">Something went wrong</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="mt-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Loading — 3A */}
              {loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              )}

              {/* Empty state — 3B */}
              {!loading && !error && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search size={40} className="text-muted-foreground mb-4" />
                  <p className="text-foreground font-semibold mb-1">
                    {filters.q ? `No products found for "${filters.q}"` : 'No products found'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search term</p>
                  <button onClick={clearSearch} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                    Clear search
                  </button>
                </div>
              )}

              {/* Results */}
              {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      brand={product.brand}
                      price={product.price}
                      imageUrl={product.image_url}
                      badge={product.badge}
                      demandScore={product.demand_score}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && !error && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('page', String(Math.max(0, page - 1))); return p; })}
                    disabled={page === 0}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors min-h-[44px]"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground tabular-nums">Page {page + 1} of {totalPages}</span>
                  <button
                    onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('page', String(Math.min(totalPages - 1, page + 1))); return p; })}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors min-h-[44px]"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
