import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import NewsletterCard from '@/components/NewsletterCard';
import { BackButton } from '@/components/BackButton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CATEGORY_ORDER = ['Trending', 'Fashion', 'Lifestyle', 'Tech', 'General'] as const;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Trending: 'The most read drops right now',
  Fashion: 'Style, drops and what is selling',
  Lifestyle: 'How people are living and spending',
  Tech: 'Gadgets, gear and what is next',
  General: 'Everything else worth knowing',
};

interface Newsletter {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  cover_image_url: string | null;
  category: string | null;
}

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('newsletters')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setNewsletters((data as Newsletter[]) || []);
      setLoading(false);
    };
    fetchData();

    const fetchCount = async () => {
      const { count } = await supabase
        .from('newsletter_waitlist')
        .select('*', { count: 'exact', head: true });
      if (count && count > 0) setWaitlistCount(count);
    };
    fetchCount();
  }, []);

  const grouped = newsletters.reduce<Record<string, Newsletter[]>>((acc, nl) => {
    const cat = nl.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(nl);
    return acc;
  }, {});

  const availableCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length > 0);

  const scrollToSection = (cat: string) => {
    setActiveCategory(cat);
    const target = cat === 'All' ? availableCategories[0] : cat;
    sectionRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>Newsletters — Coming Soon | Signal</title>
        <meta name="description" content="Curated product drops and trend reports, delivered to your inbox. Join the waitlist." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <BackButton />

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-8 mt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
              Signal Newsletters
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight">
              Curated drops. Right to your inbox.
            </h1>
            <p className="text-muted-foreground text-base mt-4 leading-relaxed">
              Hand-picked product roundups, trend reports, and exclusive finds — delivered as email newsletters.
              Be the first to know when we launch.
            </p>
            {waitlistCount && waitlistCount > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Join {waitlistCount.toLocaleString()} reader{waitlistCount !== 1 ? 's' : ''} already waiting
              </p>
            )}
          </div>

          {/* Sticky Category Nav */}
          {!loading && availableCategories.length > 0 && (
            <div className="sticky top-16 z-10 bg-background py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border mb-8">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {(['All', ...availableCategories] as string[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => scrollToSection(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Sections */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-secondary rounded-lg animate-pulse aspect-[3/2]" />
              ))}
            </div>
          ) : availableCategories.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-foreground font-semibold text-lg">Newsletters coming soon</p>
              <p className="text-muted-foreground text-sm mt-2">
                We're putting the finishing touches on our first drops.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {availableCategories.map((cat) => (
                <section
                  key={cat}
                  ref={(el: HTMLDivElement | null) => { sectionRefs.current[cat] = el; }}
                  className="scroll-mt-28"
                >
                  <div className="mb-6">
                    {cat}>{cat}</h2>
                    <div className="h-px bg-border mt-2 mb-2" />
                    <p className="text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[cat]}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grouped[cat].map((nl) => (
                      <NewsletterCard
                        key={nl.id}
                        id={nl.id}
                        title={nl.title}
                        slug={nl.slug}
                        intro={nl.intro}
                        coverImageUrl={nl.cover_image_url}
                        productCount={0}
                        category={nl.category || 'General'}
                        comingSoon
                        blurred
                        showSubscribe
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
