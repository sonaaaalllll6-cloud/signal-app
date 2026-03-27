import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

type Category = 'All' | 'Tech' | 'Accessories' | 'Collectibles' | 'Creative Tools' | 'Lifestyle';
type SortOption = 'trending' | 'newest' | 'price_asc' | 'price_desc';

export interface Filters {
  category: Category;
  minPrice: string;
  maxPrice: string;
  trendingOnly: boolean;
  sort: SortOption;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const categories: Category[] = ['All', 'Tech', 'Accessories', 'Collectibles', 'Creative Tools', 'Lifestyle'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

const FilterContent = ({ filters, onChange }: FilterSidebarProps) => (
  <div className="space-y-5">
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Category</label>
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value as Category })}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Price Range</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
          placeholder="Min"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          placeholder="Max"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trending Only</label>
      <button
        onClick={() => onChange({ ...filters, trendingOnly: !filters.trendingOnly })}
        className={`w-10 h-6 rounded-full transition-colors duration-200 ${
          filters.trendingOnly ? 'bg-primary' : 'bg-border'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-200 ml-1 ${
          filters.trendingOnly ? 'translate-x-4' : ''
        }`} />
      </button>
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Sort</label>
      <select
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  </div>
);

const FilterSidebar = ({ filters, onChange }: FilterSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-56 shrink-0">
        <FilterContent filters={filters} onChange={onChange} />
      </div>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterContent filters={filters} onChange={onChange} />
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
