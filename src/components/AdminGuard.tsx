import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading')
  const navigate = useNavigate()

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    // Step 1: verify active session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login', { replace: true })
      return
    }

    // Step 2: verify ADMIN role from user_roles table
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (roleRow?.role !== 'ADMIN') {
      await supabase.auth.signOut()
      navigate('/admin/login', { replace: true })
      return
    }

    setStatus('authorized')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    )
  }

  // status === 'authorized'
  return <>{children}</>
}
