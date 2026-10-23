'use client';

import { useSearchParams } from 'next/navigation';
import PlatformSubscriptionsPanel from '../../../components/platform/PlatformSubscriptionsPanel';

export default function ManageSubscriptionClient() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  return (
    <PlatformSubscriptionsPanel initialEmail={emailFromUrl} embedded={false} allowEmailChange />
  );
}
