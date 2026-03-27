import { supabase } from '@/lib/supabase';

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const newsletters = [
  { title: 'Signal', slug: 'signal', intro: 'The weekly pulse of what the internet is buying.' },
  { title: 'Circuit', slug: 'circuit', intro: 'Tech that actually matters this week.' },
  { title: 'Drop Culture', slug: 'drop-culture', intro: 'Limited drops, high demand, zero fluff.' },
  { title: 'Future Collectibles', slug: 'future-collectibles', intro: 'Objects that hold value over time.' },
  { title: 'Creator Cabinet', slug: 'creator-cabinet', intro: 'Tools the best creators use daily.' },
  { title: 'Modern Desk', slug: 'modern-desk', intro: 'The focused work setup, curated weekly.' },
  { title: 'Internet Finds', slug: 'internet-finds', intro: 'The best things found on the internet this week.' },
  { title: 'Quiet Luxury', slug: 'quiet-luxury', intro: 'Premium products without the noise.' },
  { title: 'Edge', slug: 'edge', intro: 'Products at the frontier of design and function.' },
  { title: 'Object Society', slug: 'object-society', intro: 'Objects worth owning, worth keeping.' },
];

interface ProductSeed {
  name: string;
  brand: string;
  price: number;
  category: string;
}

const productsByCategory: Record<string, ProductSeed[]> = {
  Tech: [
    { name: 'Anker 737 Power Bank', brand: 'Anker', price: 85, category: 'Tech' },
    { name: 'Logitech MX Keys Mini', brand: 'Logitech', price: 99, category: 'Tech' },
    { name: 'Sony WH-1000XM5', brand: 'Sony', price: 279, category: 'Tech' },
    { name: 'Apple AirTag 4-Pack', brand: 'Apple', price: 99, category: 'Tech' },
    { name: 'Elgato Key Light Air', brand: 'Elgato', price: 129, category: 'Tech' },
    { name: 'Kindle Paperwhite', brand: 'Amazon', price: 139, category: 'Tech' },
  ],
  Accessories: [
    { name: 'Peak Design Everyday Backpack 20L', brand: 'Peak Design', price: 279, category: 'Accessories' },
    { name: 'Bellroy Slim Sleeve Wallet', brand: 'Bellroy', price: 49, category: 'Accessories' },
    { name: 'Nomad Base Station', brand: 'Nomad', price: 99, category: 'Accessories' },
    { name: 'Moment iPhone Case', brand: 'Moment', price: 39, category: 'Accessories' },
    { name: 'Tile Mate 4-Pack', brand: 'Tile', price: 59, category: 'Accessories' },
    { name: 'Incase Icon Backpack', brand: 'Incase', price: 119, category: 'Accessories' },
  ],
  Collectibles: [
    { name: 'LEGO Architecture Skyline', brand: 'LEGO', price: 59, category: 'Collectibles' },
    { name: 'Hot Wheels Premium Car Culture', brand: 'Hot Wheels', price: 29, category: 'Collectibles' },
    { name: 'Polaroid Now Camera', brand: 'Polaroid', price: 119, category: 'Collectibles' },
    { name: 'Instax Mini Film 60-Pack', brand: 'Fujifilm', price: 39, category: 'Collectibles' },
    { name: 'Moleskine Limited Edition', brand: 'Moleskine', price: 35, category: 'Collectibles' },
    { name: 'Funko Pop Deluxe', brand: 'Funko', price: 25, category: 'Collectibles' },
  ],
  'Creative Tools': [
    { name: 'Wacom Intuos Pro Medium', brand: 'Wacom', price: 379, category: 'Creative Tools' },
    { name: 'Rode NT-USB Mini', brand: 'Rode', price: 99, category: 'Creative Tools' },
    { name: 'Elgato Stream Deck MK.2', brand: 'Elgato', price: 149, category: 'Creative Tools' },
    { name: 'DJI OM 5 Gimbal', brand: 'DJI', price: 159, category: 'Creative Tools' },
    { name: 'Faber-Castell Art Set', brand: 'Faber-Castell', price: 45, category: 'Creative Tools' },
    { name: 'Loupedeck Creative Tool', brand: 'Loupedeck', price: 269, category: 'Creative Tools' },
  ],
  Lifestyle: [
    { name: 'Fellow Stagg EKG Kettle', brand: 'Fellow', price: 165, category: 'Lifestyle' },
    { name: 'Ember Mug 2 14oz', brand: 'Ember', price: 149, category: 'Lifestyle' },
    { name: 'Aesop Resurrection Aromatique', brand: 'Aesop', price: 45, category: 'Lifestyle' },
    { name: 'Muji Smooth Ballpoint Set', brand: 'Muji', price: 18, category: 'Lifestyle' },
    { name: 'Poketo Studio Planner', brand: 'Poketo', price: 38, category: 'Lifestyle' },
    { name: 'Baxter of California Grooming Kit', brand: 'Baxter of California', price: 65, category: 'Lifestyle' },
  ],
};

function getBadge(score: number): string | null {
  if (score >= 80) return 'trending';
  if (score >= 50) return 'rising';
  if (score >= 20) return 'popular';
  return null;
}

export async function seedDatabase() {
  // Insert newsletters
  const newsletterInserts = newsletters.map((n) => ({
    title: n.title,
    slug: n.slug,
    intro: n.intro,
    cover_image_url: `https://picsum.photos/seed/${n.slug}/800/400`,
    is_published: true,
  }));

  const { data: insertedNewsletters, error: nErr } = await supabase
    .from('newsletters')
    .upsert(newsletterInserts, { onConflict: 'slug' })
    .select();
  if (nErr) throw nErr;

  // Insert products
  const allProducts = Object.values(productsByCategory).flat();
  const productInserts = allProducts.map((p) => {
    const s = slugify(p.name);
    const demandScore = Math.floor(Math.random() * 81) + 15;
    return {
      name: p.name,
      brand: p.brand,
      price: p.price,
      category: p.category,
      image_url: `https://picsum.photos/seed/${s}/600/600`,
      affiliate_url: `https://example.com/buy/${s}`,
      demand_score: demandScore,
      badge: getBadge(demandScore),
      description: `Premium ${p.category.toLowerCase()} product by ${p.brand}. Built for quality and designed to last.`,
      is_featured: Math.random() > 0.7,
      is_sponsored: false,
    };
  });

  const { data: insertedProducts, error: pErr } = await supabase
    .from('products')
    .insert(productInserts)
    .select();
  if (pErr) throw pErr;

  // Assign products to newsletters (10 per newsletter, overlap allowed)
  if (insertedNewsletters && insertedProducts) {
    const npInserts: { newsletter_id: string; product_id: string; sort_order: number }[] = [];
    insertedNewsletters.forEach((nl, nlIdx) => {
      for (let i = 0; i < 10; i++) {
        const pIdx = (nlIdx * 3 + i) % insertedProducts.length;
        npInserts.push({
          newsletter_id: nl.id,
          product_id: insertedProducts[pIdx].id,
          sort_order: i + 1,
        });
      }
    });
    const { error: npErr } = await supabase.from('newsletter_products').insert(npInserts);
    if (npErr) throw npErr;
  }

  // Insert 100 mock clicks
  if (insertedProducts) {
    const clickInserts = [];
    for (let i = 0; i < 100; i++) {
      const p = insertedProducts[i % insertedProducts.length];
      const daysAgo = Math.random() * 7;
      clickInserts.push({
        product_id: p.id,
        session_id: `session-${Math.random().toString(36).slice(2, 10)}`,
        ip_hash: `hash-${Math.random().toString(36).slice(2, 10)}`,
        created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      });
    }
    const { error: cErr } = await supabase.from('clicks').insert(clickInserts);
    if (cErr) throw cErr;
  }

  // Insert 50 mock watchlist rows
  if (insertedProducts) {
    const wInserts = [];
    for (let i = 0; i < 50; i++) {
      const p = insertedProducts[i % insertedProducts.length];
      wInserts.push({
        product_id: p.id,
        user_id: '00000000-0000-0000-0000-000000000000', // placeholder
      });
    }
    // Watchlist may fail if no auth user exists — that's ok for seed
    try {
      await supabase.from('watchlist').insert(wInserts);
    } catch {
      // Watchlist may fail if no auth user — ok for seed
    }
  }

  return true;
}
