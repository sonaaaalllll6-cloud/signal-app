import { Suspense, lazy } from 'react'
import { StatCardSkeleton } from '@/components/LoadingSkeleton'

const AdminCharts = lazy(() => import('@/components/AdminCharts'))

export default function AdminAnalytics() {
  return (
    <div>
      <h1 className="font-serif text-xl font-semibold mb-6">Analytics</h1>
      <Suspense fallback={
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-5 h-80 animate-pulse">
                <div className="skeleton-line w-32 mb-4" />
                <div className="skeleton-line w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      }>
        <AdminCharts />
      </Suspense>
    </div>
  )
}
