'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { persistReferralCode } from '../lib/referralStorage';

/**
 * Captures ?ref= from the URL, validates it, and persists across navigation/checkout.
 */
export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (!ref?.trim()) return;

    const code = ref.trim().toUpperCase();

    fetch(`/api/referrals/validate?code=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid && data.code) {
          persistReferralCode(data.code);
        }
      })
      .catch((err) => console.error('Referral validation failed:', err));
  }, [ref]);

  return null;
}
