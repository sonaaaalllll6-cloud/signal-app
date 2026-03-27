import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const tiers = [
  {
    name: 'Basic',
    price: '₹5,000',
    popular: false,
    features: [
      'Product listed in drop',
      'Signal badge (Trending / Rising)',
      'Direct buy CTA',
      'Drop runs 7 days',
    ],
    payLink: 'https://rzp.io/l/BASIC_LINK_HERE', // TODO: replace with real Razorpay ₹5,000 payment link
    label: 'Pay ₹5,000 & Get Started',
  },
  {
    name: 'Standard',
    price: '₹8,000',
    popular: true,
    features: [
      'Everything in Basic',
      'Brand name featured in drop',
      'Product highlighted with editorial context',
      'Engagement analytics after drop',
    ],
    payLink: 'https://rzp.io/l/STANDARD_LINK_HERE', // TODO: replace with real Razorpay ₹8,000 payment link
    label: 'Pay ₹8,000 & Get Started',
  },
  {
    name: 'Featured',
    price: '₹12,000',
    popular: false,
    features: [
      'Everything in Standard',
      '"This drop is led by [Brand]" at top',
      'Brand logo displayed',
      'Priority product placement',
      'Post-drop performance report',
    ],
    payLink: 'https://rzp.io/l/FEATURED_LINK_HERE', // TODO: replace with real Razorpay ₹12,000 payment link
    label: 'Pay ₹12,000 & Get Started',
  },
];

export default function AdvertisePage() {
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>For Brands — Signal</title>
        <meta
          name="description"
          content="Put your brand inside a curated Signal drop. Reach high-intent buyers."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <BackButton />
      </div>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
          For Brands
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground leading-tight mb-6">
          Put your brand inside a curated drop
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          Signal drops are curated product experiences sent to high-intent audiences.
          Your brand gets featured alongside products people are already discovering.
        </p>
        <button
          onClick={scrollToContact}
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity min-h-[44px]"
        >
          Get in touch
        </button>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-serif text-2xl text-center text-foreground mb-12">
            How a drop works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Your product, in context',
                body: 'We place your product inside a curated drop alongside 10–12 carefully selected products. Not an ad. A buying environment.',
              },
              {
                num: '02',
                title: 'You bring the audience',
                body: 'Share the drop link to your Instagram, WhatsApp, or email list. Your audience arrives in a premium discovery experience instead of a product page.',
              },
              {
                num: '03',
                title: 'Higher buying intent',
                body: 'Users who arrive through a drop are already in discovery mode. Signal badges show trending and rising products. Buy CTAs are clear and direct.',
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col gap-3">
                <span className="font-mono text-3xl font-light text-muted-foreground/40">
                  {step.num}
                </span>
                <h3 className="font-medium text-foreground text-base">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl text-foreground mb-2">Drop sponsorship pricing</h2>
          <p className="text-muted-foreground text-sm">Simple, transparent. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border bg-background p-6 ${
                tier.popular
                  ? 'border-primary shadow-sm ring-1 ring-primary'
                  : 'border-border'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">{tier.name}</p>
                <p className="font-serif text-3xl text-foreground">{tier.price}</p>
              </div>
              <ul className="flex-1 space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 text-primary flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.payLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center py-2.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90 min-h-[44px] flex items-center justify-center ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:bg-secondary'
                }`}
              >
                {tier.label}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure payment via Razorpay · UPI, cards, net banking accepted · Slot confirmed within 2 hours of payment
        </p>
      </section>

      {/* Example drop preview */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-serif text-2xl text-foreground mb-4">What a drop looks like</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Every drop is live on Signal — brands share the URL directly with their audience.
          </p>
          <div className="border border-border rounded-xl overflow-hidden bg-background text-left">
            <div className="bg-secondary/60 px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <span className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                browse-whisper.lovable.app/newsletters
              </span>
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Example Drop</p>
              <h3 className="font-serif text-2xl text-foreground mb-2">The Glow Drop</h3>
              <p className="text-sm text-muted-foreground mb-4">
                12 curated skincare products with trending signal, editorial context, and direct buy CTAs.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  This drop is led by [Brand]
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-secondary rounded-lg aspect-square animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <Link
            to="/newsletters"
            className="inline-block mt-6 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            View live newsletters →
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section ref={contactRef} className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-3xl text-foreground mb-3">
          Ready to be part of a drop?
        </h2>
        <p className="text-muted-foreground text-base mb-8">
          Reach out and we will set up your brand in an upcoming drop within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/91XXXXXXXXXX" // TODO: replace 91XXXXXXXXXX with your real WhatsApp number
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Message on WhatsApp
          </a>
          <a
            href="mailto:youremail@gmail.com" // TODO: replace with your real contact email
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-medium rounded-md hover:bg-secondary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Send an email
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-5">
          Response within 2 hours · Mon–Sat · 10am–8pm IST
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Prefer to pay after a quick call? Message us on WhatsApp first.
        </p>
      </section>

        <Footer />
      </div>
    </>
  );
}
