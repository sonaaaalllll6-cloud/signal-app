import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewsletterDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/newsletters', { replace: true });
  }, [navigate]);

  return null;
}
