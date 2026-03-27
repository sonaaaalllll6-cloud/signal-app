import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404:', location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found — Signal</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-4 py-24">
          <p className="font-serif text-8xl font-bold text-muted-foreground/20 select-none leading-none">
            404
          </p>
          <div className="space-y-2 -mt-2">
            <h1 className="font-serif text-3xl text-foreground">Page not found</h1>
            <p className="text-muted-foreground text-sm max-w-xs">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Link
              to="/"
              className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity min-h-[44px] flex items-center"
            >
              Go to Homepage
            </Link>
            <Link
              to="/products"
              className="px-6 py-2.5 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-secondary transition-colors min-h-[44px] flex items-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default NotFound;
