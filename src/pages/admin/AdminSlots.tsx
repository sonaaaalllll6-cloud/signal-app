import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToastNotify } from '@/components/Toast'
import { StatCardSkeleton } from '@/components/LoadingSkeleton'
import { formatPrice } from '@/utils'
import { X, Search } from 'lucide-react'

interface Slot {
  slot_position: number
  is_active: boolean
  product_id: string | null
  start_date: string | null
  end_date: string | null
  product?: { name: string; image_url: string } | null
}

interface SlotProduct { id: string; name: string; brand: string; price: number; image_url: string }

export default function AdminSlots() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [assignSlot, setAssignSlot] = useState<number | null>(null)
  const [products, setProducts] = useState<SlotProduct[]>([])
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<SlotProduct | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const notify = useToastNotify()

  useEffect(() => { fetchSlots() }, [])

  async function fetchSlots() {
    const { data } = await supabase
      .from('sponsored_slots')
      .select('slot_position, is_active, product_id, start_date, end_date, products(name, image_url)')
      .order('slot_position')

    const mapped: Slot[] = [1, 2, 3, 4].map(pos => {
      const found = (data ?? []).find((s: { slot_position: number; is_active: boolean; product_id: string | null; start_date: string | null; end_date: string | null; products: { name: string; image_url: string } | null }) => s.slot_position === pos && s.is_active)
      return found
        ? { slot_position: pos, is_active: true, product_id: found.product_id, start_date: found.start_date, end_date: found.end_date, product: found.products }
        : { slot_position: pos, is_active: false, product_id: null, start_date: null, end_date: null, product: null }
    })
    setSlots(mapped)
    setLoading(false)
  }

  async function openAssignModal(pos: number) {
    setAssignSlot(pos)
    setSelectedProduct(null)
    setStartDate('')
    setEndDate('')
    setIsActive(true)
    setSearch('')
    const { data } = await supabase.from('products').select('id, name, brand, price, image_url').is('deleted_at', null).order('name')
    setProducts(data ?? [])
  }

  async function handleSave() {
    if (!selectedProduct || !assignSlot) return
    setSaving(true)
    // Upsert: delete old for this position, insert new
    await supabase.from('sponsored_slots').delete().eq('slot_position', assignSlot)
    const { error } = await supabase.from('sponsored_slots').insert({
      product_id: selectedProduct.id,
      slot_position: assignSlot,
      start_date: startDate || null,
      end_date: endDate || null,
      is_active: isActive,
    })
    setSaving(false)
    if (error) { notify(error.message, 'error'); return }
    notify(`Slot ${assignSlot} updated`)
    setAssignSlot(null)
    fetchSlots()
  }

  async function clearSlot(pos: number) {
    await supabase.from('sponsored_slots').update({ is_active: false }).eq('slot_position', pos)
    notify(`Slot ${pos} cleared`)
    fetchSlots()
  }

  const filtered = products.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold mb-6">Sponsored Slots</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map(s => (
          <div key={s.slot_position} className={`rounded-lg border p-5 ${s.is_active ? 'bg-card' : 'bg-card border-dashed'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Slot {s.slot_position}</h3>
              {s.is_active ? <span className="badge-active">Active</span> : <span className="badge-empty">Empty</span>}
            </div>
            {s.product && s.is_active ? (
              <div className="flex items-center gap-3 mb-3">
                <img src={s.product.image_url} alt="" className="w-12 h-12 rounded object-cover bg-muted" />
                <div>
                  <p className="text-sm font-medium">{s.product.name}</p>
                  {s.start_date && s.end_date && (
                    <p className="text-xs text-muted-foreground">{s.start_date} → {s.end_date}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">No product assigned</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => openAssignModal(s.slot_position)} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90">Assign</button>
              {s.is_active && (
                <button onClick={() => clearSlot(s.slot_position)} className="px-3 py-1.5 text-xs border rounded-md hover:bg-muted">Clear</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setAssignSlot(null)} />
          <div className="bg-card rounded-lg border shadow-xl w-[440px] max-w-[95vw] max-h-[90vh] overflow-y-auto relative z-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Assign Slot {assignSlot}</h3>
              <button onClick={() => setAssignSlot(null)}><X size={20} /></button>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-8 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full flex items-center gap-3 p-2 rounded text-sm text-left hover:bg-muted transition-colors ${selectedProduct?.id === p.id ? 'border-2 border-primary' : 'border border-transparent'}`}
                >
                  <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand} · {formatPrice(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 text-sm bg-background border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 text-sm bg-background border rounded-md" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded border-border" />
              Active
            </label>
            <button
              onClick={handleSave}
              disabled={!selectedProduct || saving}
              className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Slot'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
