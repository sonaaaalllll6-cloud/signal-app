import { useState } from 'react';
import { Link } from 'react-router-dom';
import DemandBadge from './DemandBadge';
import BuyButton from './BuyButton';
import WatchButton from './WatchButton';
import { formatPrice } from '@/utils';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  badge: 'trending' | 'rising' | 'popular' | null;
  demandScore: number;
  lazyLoad?: boolean;
}

const ProductCard = ({ id, name, brand, price, imageUrl, badge, lazyLoad = true }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/products/${id}`}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer block"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading={lazyLoad ? 'lazy' : 'eager'}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <svg className="w-12 h-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badge top-left */}
        {badge && (
          <div className="absolute top-2 left-2">
            <DemandBadge badge={badge} />
          </div>
        )}
        {/* Watch button top-right */}
        <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
          <WatchButton productId={id} compact />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{brand}</p>
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{name}</h3>
        <p className="text-base font-bold text-foreground pt-0.5 tabular-nums">{formatPrice(price)}</p>
        {/* Buy button */}
        <div className="pt-2" onClick={(e) => e.stopPropagation()}>
          <BuyButton productId={id} fullWidth />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
    <div className="aspect-square bg-secondary" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-secondary rounded w-16" />
      <div className="h-4 bg-secondary rounded w-3/4" />
      <div className="h-5 bg-secondary rounded w-1/3" />
      <div className="h-10 bg-secondary rounded-lg mt-2" />
    </div>
  </div>
);
