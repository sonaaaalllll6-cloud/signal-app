import { useState, FormEvent } from 'react';
import { useToastNotify } from './Toast';
import { truncate } from '@/utils';
import { Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NewsletterCardProps {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  coverImageUrl: string | null;
  productCount: number;
  category?: string;
  comingSoon?: boolean;
  blurred?: boolean;
  showSubscribe?: boolean;
}

const NewsletterCard = ({
  title,
  slug,
  intro,
  coverImageUrl,
  category,
  comingSoon = false,
  blurred = false,
  showSubscribe = false,
}: NewsletterCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useToastNotify();

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email.');
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase
      .from('newsletter_waitlist')
      .insert({ email: trimmed, newsletter_slug: slug });
    setSubmitting(false);
    if (insertError) {
      if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        setError('Already subscribed!');
        notify('Already subscribed!', 'error');
      } else {
        setError('Something went wrong.');
        notify('Something went wrong', 'error');
      }
      return;
    }
    setSubscribed(true);
    setEmail('');
    notify('You\u2019re on the waitlist!', 'success');
  };

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="aspect-video bg-secondary overflow-hidden relative">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
            style={blurred ? { filter: 'blur(2px)', opacity: 0.8 } : undefined}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No cover</div>
        )}
        {comingSoon && (
          <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        {intro && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{intro}</p>
        )}
        {category && (
          <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-medium self-start">
            {category}
          </span>
        )}

        {showSubscribe && (
          <div className="mt-auto pt-3">
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 w-full border border-border rounded-md py-2 text-sm text-green-600 font-medium">
                <Check size={16} />
                You're on the list
              </div>
            ) : !showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 w-full border border-border rounded-md py-2 text-sm text-foreground hover:bg-secondary transition-colors min-h-[44px]"
              >
                <Bell size={14} />
                Notify Me when this drops
              </button>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={submitting}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {submitting ? 'Submitting…' : 'Subscribe'}
                </button>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterCard;

export const NewsletterCardSkeleton = () => (
  <div className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
    <div className="aspect-video bg-secondary" />
    <div className="p-4 space-y-2">
      <div className="h-6 bg-secondary rounded w-3/4" />
      <div className="h-4 bg-secondary rounded w-full" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-6 bg-secondary rounded-full w-20" />
      </div>
    </div>
  </div>
);
