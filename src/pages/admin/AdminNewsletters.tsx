import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToastNotify } from '@/components/Toast'
import { TableSkeleton } from '@/components/LoadingSkeleton'
import { NewsletterPanel } from '@/components/NewsletterPanel'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export interface Newsletter {
  id: string
  title: string
  slug: string
  intro: string
  cover_image_url: string | null
  is_published: boolean
  created_at: string
  product_count?: number
}

export default function AdminNewsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editNl, setEditNl] = useState<Newsletter | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Newsletter | null>(null)
  const notify = useToastNotify()

  useEffect(() => { fetchNewsletters() }, [])

  async function fetchNewsletters() {
    const { data } = await supabase
      .from('newsletters')
      .select('*, newsletter_products(id)')
      .order('created_at', { ascending: false })

    const mapped = (data ?? []).map((n: Newsletter & { newsletter_products?: { id: string }[] }) => ({
      ...n,
      product_count: n.newsletter_products?.length ?? 0,
      newsletter_products: undefined,
    }))
    setNewsletters(mapped)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('newsletters').delete().eq('id', deleteTarget.id)
    if (error) { notify(error.message, 'error'); return }
    notify('Newsletter deleted')
    setDeleteTarget(null)
    fetchNewsletters()
  }

  if (loading) return <TableSkeleton rows={5} cols={5} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-xl font-semibold">Newsletters</h1>
        <button onClick={() => { setEditNl(null); setPanelOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          <Plus size={16} /> Create Newsletter
        </button>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Slug</th><th>Products</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {newsletters.map(n => (
              <tr key={n.id}>
                <td className="font-medium">{n.title}</td>
                <td className="text-muted-foreground text-xs font-mono">{n.slug}</td>
                <td>{n.product_count}</td>
                <td>{n.is_published ? <span className="badge-published">Published</span> : <span className="badge-empty">Draft</span>}</td>
                <td className="text-sm text-muted-foreground">{format(new Date(n.created_at), 'MMM d, yyyy')}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditNl(n); setPanelOpen(true) }} className="p-1.5 hover:bg-muted rounded transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget(n)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {newsletters.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No newsletters yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="bg-card rounded-lg border shadow-xl p-6 max-w-sm relative z-50">
            <h3 className="font-semibold mb-2">Delete "{deleteTarget.title}"?</h3>
            <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted">Cancel</button>
              <button onClick={handleDelete} className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}

      {panelOpen && (
        <NewsletterPanel
          newsletter={editNl}
          onClose={() => setPanelOpen(false)}
          onSaved={() => { setPanelOpen(false); fetchNewsletters() }}
        />
      )}
    </div>
  )
}
