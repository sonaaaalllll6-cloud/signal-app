import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BackButton } from '@/components/BackButton';
import { Loader2 } from 'lucide-react';

const SignupPage = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPw) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setError('');
    setSuccess('');
    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) setError(error.message);
    else setSuccess('Check your email to confirm your account.');
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) console.error('Google sign in error:', error.message);
  };

  return (
    <>
      <Helmet>
        <title>Create Account — Signal</title>
        <meta name="description" content="Create your Signal account and start discovering curated products." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <BackButton />
          <div className="text-center">
            <h1 className="font-serif text-3xl text-foreground">Create account</h1>
            <p className="text-sm text-muted-foreground mt-2">Start discovering curated products</p>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg">{error}</div>}
          {success && <div className="bg-green-100 text-green-800 text-sm px-4 py-2 rounded-lg">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
              <input id="confirm" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 min-h-[44px] rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <button onClick={handleGoogle} disabled={loading} className="w-full border border-border py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/auth/login" className="text-foreground font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
      <Footer />
      </div>
    </>
  );
};

export default SignupPage;
