import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border bg-background mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl text-foreground shrink-0">
          Signal
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-6 flex-wrap justify-center text-sm">
          <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <Link to="/newsletters" className="text-muted-foreground hover:text-foreground transition-colors">
            Newsletters
          </Link>
          <Link to="/account/watchlist" className="text-muted-foreground hover:text-foreground transition-colors">
            Watchlist
          </Link>
        </nav>

        {/* Right nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/advertise"
            className="font-medium px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary transition-colors"
          >
            For Brands
          </Link>
          <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Signal. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
