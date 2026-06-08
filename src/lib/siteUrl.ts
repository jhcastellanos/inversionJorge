/**
 * Resolves the public site base URL for referral links and redirects.
 */
export function getSiteBaseUrl(host?: string | null, protocol?: string | null): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (host) {
    const proto = protocol || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://inversion-jorge.vercel.app';
}

export function buildReferralLink(code: string, host?: string | null, protocol?: string | null): string {
  const base = getSiteBaseUrl(host, protocol);
  return `${base}/?ref=${encodeURIComponent(code)}`;
}
