import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
