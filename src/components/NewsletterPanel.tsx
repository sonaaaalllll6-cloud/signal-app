import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToastNotify } from '@/components/Toast';
import { X, GripVertical, Search } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const newsletterSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  intro: z.string().min(50, 'Intro must be at least 50 characters').max(300, 'Intro must be under 300 characters'),
  cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_published: z.boolean().default(false),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface AssignableProduct {
  id: string;
  name: string;
  brand: string;
  image_url: string;
}

interface NewsletterPanelProps {
  open?: boolean;
  onClose: () => void;
  newsletter?: {
    id: string;
    title: string;
    slug: string;
    intro: string;
    cover_image_url: string | null;
    is_published: boolean;
  } | null;
  onSaved: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function NewsletterPanel({ open, onClose, newsletter, onSaved }: NewsletterPanelProps) {
  const [form, setForm] = useState<NewsletterFormData>({
    title: '',
    slug: '',
    intro: '',
    cover_image_url: '',
    is_published: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewsletterFormData, string>>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNewsletterId, setSavedNewsletterId] = useState<string | null>(null);

  // Product assignment state
  const [allProducts, setAllProducts] = useState<AssignableProduct[]>([]);
  const [assignedProducts, setAssignedProducts] = useState<AssignableProduct[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);
  const notify = useToastNotify();

  const isEdit = Boolean(newsletter);
  const activeNewsletterId = savedNewsletterId ?? newsletter?.id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (newsletter) {
      setForm({
        title: newsletter.title,
        slug: newsletter.slug,
        intro: newsletter.intro,
        cover_image_url: newsletter.cover_image_url ?? '',
        is_published: newsletter.is_published,
      });
      setSlugManuallyEdited(true);
      loadAssignedProducts(newsletter.id);
    } else {
      setForm({ title: '', slug: '', intro: '', cover_image_url: '', is_published: false });
      setSlugManuallyEdited(false);
      setAssignedProducts([]);
    }
    setErrors({});
    setSavedNewsletterId(null);
  }, [newsletter, open]);

  useEffect(() => {
    if (open) {
      supabase
        .from('products')
        .select('id, name, brand, image_url')
        .is('deleted_at', null)
        .order('name')
        .then(({ data }) => setAllProducts(data ?? []));
    }
  }, [open]);

  async function loadAssignedProducts(nlId: string) {
    const { data } = await supabase
      .from('newsletter_products')
      .select('product_id, sort_order, products(id, name, brand, image_url)')
      .eq('newsletter_id', nlId)
      .order('sort_order');

    const mapped: AssignableProduct[] = (data ?? [])
      .map((row) => {
        const p = row.products as unknown as AssignableProduct | null;
        return p ? { id: p.id, name: p.name, brand: p.brand, image_url: p.image_url } : null;
      })
      .filter((p): p is AssignableProduct => p !== null);

    setAssignedProducts(mapped);
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }));
    setErrors((prev) => ({ ...prev, title: undefined }));
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
    setErrors((prev) => ({ ...prev, slug: undefined }));
  }

  function updateField<K extends keyof NewsletterFormData>(key: K, value: NewsletterFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      cover_image_url: form.cover_image_url || undefined,
    };
    const result = newsletterSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof NewsletterFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof NewsletterFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const insertData = {
      title: result.data.title,
      slug: result.data.slug,
      intro: result.data.intro,
      cover_image_url: result.data.cover_image_url || null,
      is_published: result.data.is_published,
    };

    setSaving(true);
    if (isEdit && newsletter) {
      const { error } = await supabase.from('newsletters').update(insertData).eq('id', newsletter.id);
      if (error) {
        notify(error.message, 'error');
        setSaving(false);
        return;
      }
      notify('Newsletter updated successfully');
      setSavedNewsletterId(newsletter.id);
    } else {
      const { data: created, error } = await supabase.from('newsletters').insert(insertData).select('id').single();
      if (error) {
        notify(error.message, 'error');
        setSaving(false);
        return;
      }
      notify('Newsletter created successfully');
      setSavedNewsletterId(created.id);
    }
    setSaving(false);
    onSaved();
  }

  function addProduct(product: AssignableProduct) {
    if (assignedProducts.some((p) => p.id === product.id)) return;
    setAssignedProducts((prev) => [...prev, product]);
  }

  function removeProduct(productId: string) {
    setAssignedProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAssignedProducts((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  async function saveAssignment() {
    if (!activeNewsletterId) return;
    setSavingAssignment(true);

    const { error: delError } = await supabase
      .from('newsletter_products')
      .delete()
      .eq('newsletter_id', activeNewsletterId);

    if (delError) {
      notify(delError.message, 'error');
      setSavingAssignment(false);
      return;
    }

    if (assignedProducts.length > 0) {
      const rows = assignedProducts.map((p, i) => ({
        newsletter_id: activeNewsletterId,
        product_id: p.id,
        sort_order: i,
      }));
      const { error: insError } = await supabase.from('newsletter_products').insert(rows);
      if (insError) {
        notify(insError.message, 'error');
        setSavingAssignment(false);
        return;
      }
    }

    notify('Product assignment saved');
    setSavingAssignment(false);
    onSaved();
  }

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        !assignedProducts.some((a) => a.id === p.id) &&
        `${p.name} ${p.brand}`.toLowerCase().includes(q),
    );
  }, [allProducts, assignedProducts, productSearch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-card border-l h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Newsletter' : 'Create Newsletter'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title" error={errors.title}>
              <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="form-input" />
            </Field>

            <Field label="Slug" error={errors.slug}>
              <input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} className="form-input" />
            </Field>

            <Field label="Intro" error={errors.intro}>
              <textarea value={form.intro} onChange={(e) => updateField('intro', e.target.value)} className="form-input min-h-[80px] resize-y" rows={3} />
            </Field>

            <Field label="Cover Image URL" error={errors.cover_image_url}>
              <input value={form.cover_image_url ?? ''} onChange={(e) => updateField('cover_image_url', e.target.value)} className="form-input" placeholder="https://... (optional)" />
            </Field>

            <label className="flex items-center gap-3 text-sm">
              <button
                type="button"
                role="switch"
                aria-checked={form.is_published}
                onClick={() => updateField('is_published', !form.is_published)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${form.is_published ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${form.is_published ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
              </button>
              Published
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Saving…' : isEdit ? 'Update Newsletter' : 'Create Newsletter'}
            </button>
          </form>

          {/* Product Assignment - only show after newsletter is saved */}
          {activeNewsletterId && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Assign Products</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Available products */}
                <div>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products…"
                      className="form-input pl-8 text-xs"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                    {filteredProducts.length === 0 && (
                      <p className="text-xs text-muted-foreground p-3 text-center">No products found</p>
                    )}
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors"
                      >
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-8 h-8 rounded object-cover bg-muted shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Assigned products */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{assignedProducts.length} products assigned</p>
                  <div className="border rounded-md min-h-[64px]">
                    {assignedProducts.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 text-center">Click products to assign</p>
                    ) : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={assignedProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                          <div className="divide-y">
                            {assignedProducts.map((p) => (
                              <SortableProductRow key={p.id} product={p} onRemove={removeProduct} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={saveAssignment}
                disabled={savingAssignment}
                className="w-full mt-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {savingAssignment ? 'Saving…' : 'Save Assignment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableProductRow({ product, onRemove }: { product: AssignableProduct; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-2 py-1.5">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical size={14} />
      </button>
      <img
        src={product.image_url}
        alt={product.name}
        className="w-8 h-8 rounded object-cover bg-muted shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <p className="text-xs font-medium truncate flex-1">{product.name}</p>
      <button onClick={() => onRemove(product.id)} className="text-muted-foreground hover:text-destructive">
        <X size={14} />
      </button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
