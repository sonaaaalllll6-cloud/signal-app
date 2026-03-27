import { Link } from 'react-router-dom';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
    <div className="bg-card rounded-lg border border-border p-6 max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
      <h2 className="font-serif text-xl text-foreground">Sign in to continue</h2>
      <p className="text-sm text-muted-foreground">You need to be logged in to add items to your watchlist.</p>
      <div className="flex gap-3">
        <Link to="/auth/login" className="flex-1 text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Log in
        </Link>
        <button onClick={onClose} className="flex-1 border border-border px-4 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default LoginModal;
