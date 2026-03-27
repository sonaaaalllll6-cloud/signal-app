import { useState, useMemo } from 'react';
import { ArrowUpDown, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  onEdit: (row: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const PAGE_SIZE = 20;

const AdminTable = ({ columns, data, onEdit, onDelete, isLoading }: AdminTableProps) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
              <th className="px-4 py-2 w-24" />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">No records found.</td></tr>
            ) : (
              paged.map((row, i) => (
                <tr key={i} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => onEdit(row)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {confirmDelete === String(row.id) ? (
                        <button onClick={() => { onDelete(String(row.id)); setConfirmDelete(null); }} className="p-1.5 rounded bg-destructive text-primary-foreground text-xs font-medium px-2">
                          Confirm
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDelete(String(row.id))} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{sorted.length} record{sorted.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page < 3 ? i : page - 2 + i;
              if (p >= totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)} className={`px-2.5 py-1 rounded text-xs font-medium ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'}`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
