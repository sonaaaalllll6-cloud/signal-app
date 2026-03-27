import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId, hashIp } from '@/utils';
import { Loader2, ExternalLink } from 'lucide-react';
import { useToastNotify } from './Toast';

interface BuyButtonProps {
  productId: string;
  fullWidth?: boolean;
}

const BuyButton = ({ productId, fullWidth = false }: BuyButtonProps) => {
  const [loading, setLoading] = useState(false);
  const notify = useToastNotify();

  const handleClick = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      let ipHash = 'unknown';
      try {
        const r = await fetch('https://api.ipify.org?format=json');
        const { ip } = await r.json() as { ip: string };
        ipHash = await hashIp(ip);
      } catch { /* proceed */ }

      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from('clicks').select('id')
        .eq('product_id', productId).eq('session_id', sessionId)
        .gte('created_at', tenMinAgo).limit(1);

      let clickId: string | null = null;
      if (!existing || existing.length === 0) {
        const { data: newClick } = await supabase
          .from('clicks')
          .insert({ product_id: productId, session_id: sessionId, ip_hash: ipHash })
          .select('id').single();
        clickId = newClick?.id ?? null;
      } else {
        clickId = existing[0].id;
      }

      const { data: product } = await supabase
        .from('products').select('affiliate_url').eq('id', productId).single();

      if (clickId) {
        await supabase.from('affiliate_redirects').insert({ click_id: clickId, product_id: productId });
      }

      if (product?.affiliate_url) {
        window.open(product.affiliate_url, '_blank');
        notify('Opening product page…', 'success');
      } else {
        notify('No purchase link available', 'error');
      }
    } catch (err) {
      console.error('BuyButton error:', err);
      notify('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${fullWidth ? 'w-full' : 'flex-1'} flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
      {loading ? 'Loading…' : 'Buy Now'}
    </button>
  );
};

export default BuyButton;
