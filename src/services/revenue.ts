import { supabase } from '@/lib/supabase'

export async function trackClick(productId: string): Promise<string | null> {
  // 1. Bot detection — silent discard, never 403
  const ua = navigator.userAgent.toLowerCase()
  const bots = ['bot','crawl','spider','slurp','bingpreview',
    'headlesschrome','phantomjs','selenium','puppeteer','playwright']
  if (bots.some(b => ua.includes(b))) return null

  // 2. Session ID
  let sid = localStorage.getItem('signal_sid')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('signal_sid', sid)
  }

  // 3. IP hash — GDPR safe, never store raw IP
  let ipHash = 'unknown'
  try {
    const r = await fetch('https://api.ipify.org?format=json')
    const { ip } = await r.json()
    const salt = import.meta.env.VITE_CLICK_SALT ?? 'fallback-salt'
    const buf = await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(ip + salt))
    ipHash = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2,'0')).join('')
  } catch {
    ipHash = 'ip-error'
  }

  // 4. Deduplication — 10 minute window
  const tenMinAgo = new Date(Date.now() - 600000).toISOString()
  const { data: dup } = await supabase.from('clicks').select('id')
    .eq('product_id', productId).eq('session_id', sid)
    .gte('created_at', tenMinAgo).limit(1)

  let clickId: string | null = null
  if (!dup || dup.length === 0) {
    const { data: click } = await supabase.from('clicks')
      .insert({ product_id: productId, session_id: sid, ip_hash: ipHash })
      .select('id').single()
    clickId = click?.id ?? null
  }

  // 5. Fetch affiliate URL — ONLY now, never before
  const { data: prod } = await supabase.from('products')
    .select('affiliate_url').eq('id', productId).single()

  // 6. Record redirect
  if (clickId && prod?.affiliate_url) {
    await supabase.from('affiliate_redirects')
      .insert({ click_id: clickId, product_id: productId })
  }

  return prod?.affiliate_url ?? null
}

export async function recalculateDemandScores(): Promise<{updated: number}> {
  const { data: products } = await supabase
    .from('products').select('id, created_at').is('deleted_at', null)

  if (!products) return { updated: 0 }

  const now = new Date()
  const h24 = new Date(now.getTime() - 86400000).toISOString()
  const d7 = new Date(now.getTime() - 604800000).toISOString()
  const h72 = new Date(now.getTime() - 259200000)

  for (const product of products) {
    const countRows = async (table: string, since: string) => {
      const { count } = await supabase.from(table)
        .select('id', { count: 'exact', head: true })
        .eq('product_id', product.id).gte('created_at', since)
      return count ?? 0
    }

    const [c24, c7d, w24, w7d] = await Promise.all([
      countRows('clicks', h24),
      countRows('clicks', d7),
      countRows('watchlist', h24),
      countRows('watchlist', d7)
    ])

    const recency = new Date(product.created_at) > h72 ? 1.2 : 1.0
    const score = Math.round((c24*1.0 + c7d*0.4 + w24*1.5 + w7d*0.6) * recency)
    const badge = score>=80 ? 'trending' : score>=50 ? 'rising' : score>=20 ? 'popular' : null

    await supabase.from('products')
      .update({ demand_score: score, badge }).eq('id', product.id)
  }

  return { updated: products.length }
}
