export const getSessionId = (): string => {
  let sid = localStorage.getItem('signal_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('signal_sid', sid);
  }
  return sid;
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

export const truncate = (s: string, n: number): string =>
  s.length > n ? s.slice(0, n) + '...' : s;

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const hashIp = async (ip: string): Promise<string> => {
  const salt = import.meta.env.VITE_CLICK_SALT || 'default-salt-change-me-in-settings';
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip + salt)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
