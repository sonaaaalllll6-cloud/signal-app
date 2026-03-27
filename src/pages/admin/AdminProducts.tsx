import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToastNotify } from '@/components/Toast'
import { TableSkeleton } from '@/components/LoadingSkeleton'
import { ProductPanel } from '@/components/ProductPanel'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { formatPrice } from '@/utils'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  image_url: string
  category: string
  affiliate_url: string
  description: string
  is_featured: boolean
  is_sponsored: boolean
  demand_score: number | null
  badge: string | null
  deleted_at: string | null
  created_at: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const notify = useToastNotify()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deleteTarget.id)
    if (error) { notify(error.message, 'error'); return }
    notify(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
    fetchProducts()
  }

  const filtered = products.filter(p =>
    `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <TableSkeleton rows={8} cols={8} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-xl font-semibold">Products</h1>
        <button onClick={() => { setEditProduct(null); setPanelOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-3 py-2 text-sm bg-card border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thumb</th><th>Name</th><th>Brand</th><th>Category</th><th>Price</th>
              <th>Score</th><th>Badge</th><th>Featured</th><th>Sponsored</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover bg-muted" /></td>
                <td className="font-medium">{p.name}</td>
                <td className="text-muted-foreground">{p.brand}</td>
                <td><span className="text-xs bg-secondary px-2 py-0.5 rounded">{p.category}</span></td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.demand_score ?? '—'}</td>
                <td>{p.badge ? (
                  <span className={
                    p.badge === 'trending' ? 'text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-medium' :
                    p.badge === 'rising' ? 'text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium' :
                    'text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-medium'
                  }>{p.badge}</span>
                ) : '—'}</td>
                <td>{p.is_featured ? '✓' : '✗'}</td>
                <td>{p.is_sponsored ? '✓' : '✗'}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditProduct(p); setPanelOpen(true) }} className="p-1.5 hover:bg-muted rounded transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="bg-card rounded-lg border shadow-xl p-6 max-w-sm relative z-50">
            <h3 className="font-semibold mb-2 text-foreground">Delete {deleteTarget.name}?</h3>
            <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted">Cancel</button>
              <button onClick={handleDelete} className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}

      {panelOpen && (
        <ProductPanel
          product={editProduct}
          onClose={() => setPanelOpen(false)}
          onSaved={() => { setPanelOpen(false); fetchProducts() }}
        />
      )}
    </div>
  )
}
