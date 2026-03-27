import { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToastNotify } from '@/components/Toast';
import { X, Eye, EyeOff } from 'lucide-react';

const CATEGORIES = ['Tech', 'Accessories', 'Collectibles', 'Creative Tools', 'Lifestyle'] as const;

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  brand: z.string().min(2, 'Brand must be at least 2 characters').max(100, 'Brand must be under 100 characters'),
  price: z.coerce.number().min(0.01, 'Price must be at least ₹0.01').max(9999999, 'Price must be under ₹99,99,999'),
  image_url: z.string().url('Must be a valid URL'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Select a valid category' }) }),
  affiliate_url: z.string().url('Must be a valid URL'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description must be under 500 characters'),
  is_featured: z.boolean().default(false),
  is_sponsored: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductPanelProps {
  open?: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image_url: string;
    category: string;
    affiliate_url: string;
    description: string;
    is_featured: boolean;
    is_sponsored: boolean;
  } | null;
  onSaved: () => void;
}

export function ProductPanel({ open, onClose, product, onSaved }: ProductPanelProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    brand: '',
    price: 0,
    image_url: '',
    category: 'Tech',
    affiliate_url: '',
    description: '',
    is_featured: false,
    is_sponsored: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [showAffiliateUrl, setShowAffiliateUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const notify = useToastNotify();

  const isEdit = Boolean(product);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        brand: product.brand,
        price: product.price,
        image_url: product.image_url,
        category: CATEGORIES.includes(product.category as typeof CATEGORIES[number])
          ? (product.category as typeof CATEGORIES[number])
          : 'Tech',
        affiliate_url: product.affiliate_url,
        description: product.description,
        is_featured: product.is_featured,
        is_sponsored: product.is_sponsored,
      });
    } else {
      setForm({
        name: '',
        brand: '',
        price: 0,
        image_url: '',
        category: 'Tech',
        affiliate_url: '',
        description: '',
        is_featured: false,
        is_sponsored: false,
      });
    }
    setErrors({});
    setShowAffiliateUrl(false);
    setShowDeleteConfirm(false);
  }, [product, open]);

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProductFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProductFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    if (isEdit && product) {
      const { error } = await supabase.from('products').update(result.data).eq('id', product.id);
      if (error) {
        notify(error.message, 'error');
        setSaving(false);
        return;
      }
      notify('Product updated successfully');
    } else {
      const { error } = await supabase.from('products').insert(result.data);
      if (error) {
        notify(error.message, 'error');
        setSaving(false);
        return;
      }
      notify('Product created successfully');
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!product) return;
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', product.id);
    if (error) {
      notify(error.message, 'error');
      setSaving(false);
      return;
    }
    notify(`${product.name} deleted`);
    setSaving(false);
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-card border-l h-full overflow-y-auto">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Name" error={errors.name}>
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="form-input" />
          </Field>

          <Field label="Brand" error={errors.brand}>
            <input value={form.brand} onChange={(e) => updateField('brand', e.target.value)} className="form-input" />
          </Field>

          <Field label="Price" error={errors.price}>
            <input type="number" step="0.01" value={form.price || ''} onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)} className="form-input" />
          </Field>

          <Field label="Image URL" error={errors.image_url}>
            <input value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} className="form-input" placeholder="https://..." />
          </Field>

          <Field label="Category" error={errors.category}>
            <select value={form.category} onChange={(e) => updateField('category', e.target.value as typeof CATEGORIES[number])} className="form-input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Affiliate URL" error={errors.affiliate_url}>
            <div className="flex gap-2">
              <input
                type={showAffiliateUrl ? 'text' : 'password'}
                value={form.affiliate_url}
                onChange={(e) => updateField('affiliate_url', e.target.value)}
                className="form-input flex-1"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => setShowAffiliateUrl(!showAffiliateUrl)}
                className="px-2 text-muted-foreground hover:text-foreground"
                title={showAffiliateUrl ? 'Hide URL' : 'Show URL'}
              >
                {showAffiliateUrl ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="form-input min-h-[100px] resize-y"
              rows={4}
            />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => updateField('is_featured', e.target.checked)} className="rounded border-border" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_sponsored} onChange={(e) => updateField('is_sponsored', e.target.checked)} className="rounded border-border" />
              Sponsored
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 text-sm font-medium text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {showDeleteConfirm && product && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-card border rounded-lg p-6 max-w-sm mx-4 shadow-lg">
              <h3 className="font-semibold mb-2">Delete {product.name}?</h3>
              <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm rounded-md border hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {saving ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
