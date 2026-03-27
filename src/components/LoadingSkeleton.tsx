export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr>{Array.from({ length: cols }).map((_, i) => <th key={i} className="px-4 py-3"><div className="h-3 w-20 bg-muted rounded animate-pulse" /></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t border-border">
              {Array.from({ length: cols }).map((_, c) => <td key={c} className="px-4 py-3"><div className="h-3 w-24 bg-muted rounded animate-pulse" /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-5 animate-pulse">
      <div className="h-3 w-20 bg-muted rounded mb-3" />
      <div className="h-6 w-16 bg-muted rounded" />
    </div>
  );
}
