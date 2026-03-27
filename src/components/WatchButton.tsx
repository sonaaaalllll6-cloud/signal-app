import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Heart, Loader2 } from 'lucide-react';
import LoginModal from './LoginModal';
import { useToastNotify } from './Toast';

interface WatchButtonProps {
  productId: string;
  compact?: boolean;
}

const WatchButton = ({ productId, compact = false }: WatchButtonProps) => {
  const { user } = useAuth();
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const notify = useToastNotify();

  const checkWatched = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('watchlist').select('id')
      .eq('user_id', user.id).eq('product_id', productId).maybeSingle();
    setIsWatched(!!data);
  }, [user, productId]);

  useEffect(() => { checkWatched(); }, [checkWatched]);

  const handleClick = async () => {
    if (!user) { setShowLogin(true); return; }
    setLoading(true);
    try {
      if (isWatched) {
        await supabase.from('watchlist').delete().eq('user_id', user.id).eq('product_id', productId);
        setIsWatched(false);
        notify('Removed from watchlist');
      } else {
        await supabase.from('watchlist').insert({ user_id: user.id, product_id: productId });
        setIsWatched(true);
        notify('Added to watchlist', 'success');
      }
    } catch (err) {
      console.error('WatchButton error:', err);
      notify('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`flex items-center justify-center w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border transition-colors duration-200 disabled:opacity-50 ${isWatched ? 'text-red-500 border-red-200' : 'text-muted-foreground hover:text-red-500'}`}
          aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className={`h-3.5 w-3.5 ${isWatched ? 'fill-red-500' : ''}`} />}
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center p-2.5 rounded-lg border border-border transition-colors duration-200 disabled:opacity-50 min-h-[44px] min-w-[44px] ${isWatched ? 'text-red-500 border-red-200 bg-red-50' : 'text-muted-foreground hover:text-red-500 hover:border-red-200'}`}
        aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isWatched ? 'fill-red-500' : ''}`} />}
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default WatchButton;
