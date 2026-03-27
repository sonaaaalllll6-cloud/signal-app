import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr || !data.session) {
      setError(authErr?.message ?? 'Login failed')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.session.user.id)
      .maybeSingle()

    if (profile?.role !== 'ADMIN') {
      await supabase.auth.signOut()
      setError('Access denied. Admin role required.')
      setLoading(false)
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-lg uppercase tracking-widest mb-1">Signal Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
