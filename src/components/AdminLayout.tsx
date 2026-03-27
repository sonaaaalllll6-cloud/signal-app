import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { BarChart3, Package, Newspaper, DollarSign, TrendingUp, Menu, X, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Overview', path: '/admin', icon: BarChart3, end: true },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Newsletters', path: '/admin/newsletters', icon: Newspaper },
  { label: 'Slots', path: '/admin/slots', icon: DollarSign },
  { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
]

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? '')
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <span className="font-sans text-sm uppercase tracking-widest text-white font-bold">Signal Admin</span>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/50 truncate mb-2">{email}</p>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 bg-[#111111] border-r border-white/10 flex-shrink-0 fixed top-0 left-0 h-full z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="w-60 bg-[#111111] h-full relative z-50">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60">
        <header className="md:hidden flex items-center h-14 px-4 bg-card border-b">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="ml-3 font-sans text-sm uppercase tracking-widest font-bold">Signal Admin</span>
        </header>
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
