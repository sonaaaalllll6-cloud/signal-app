import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Products', path: '/products' },
  { label: 'Newsletters', path: '/newsletters' },
  { label: 'Watchlist', path: '/account/watchlist' },
];

const brandNavItem = { label: 'For Brands', path: '/advertise' };

export default function SiteHeader() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl font-bold text-foreground" onClick={() => setMobileOpen(false)}>
          Signal
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={brandNavItem.path}
            className={`text-sm font-medium px-3 py-1.5 rounded-md border transition-colors ${
              location.pathname === brandNavItem.path
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-foreground hover:bg-secondary'
            }`}
          >
            {brandNavItem.label}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`text-sm py-2.5 px-3 rounded-md transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? 'text-foreground font-medium bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={brandNavItem.path}
              onClick={() => setMobileOpen(false)}
              className={`text-sm py-2.5 px-3 rounded-md font-medium border transition-colors mt-1 text-center ${
                location.pathname === brandNavItem.path
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-foreground hover:bg-secondary'
              }`}
            >
              {brandNavItem.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
