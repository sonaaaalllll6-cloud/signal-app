import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BackButton } from '@/components/BackButton';
import { Loader2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required.'); return; }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — Signal</title>
        <meta name="description" content="Reset your Signal account password." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <BackButton />
          <div className="text-center">
            <h1 className="font-serif text-3xl text-foreground">Reset password</h1>
            <p className="text-sm text-muted-foreground mt-2">We'll send you a reset link</p>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg">{error}</div>}

          {success ? (
            <div className="bg-secondary text-foreground text-sm px-4 py-3 rounded-lg text-center">
              Check your email for a reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 min-h-[44px] rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send Reset Link
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/auth/login" className="text-foreground font-medium hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
      <Footer />
      </div>
    </>
  );
};

export default ForgotPasswordPage;
