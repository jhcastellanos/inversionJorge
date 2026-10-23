import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { verifyMemberJwt, MEMBER_COOKIE } from '../../../lib/memberAuth';
import ManageSubscriptionClient from './ManageSubscriptionClient';

export default function ManageSubscriptionPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (token && verifyMemberJwt(token)) {
    redirect('/app/suscripciones');
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen ventic-bg flex items-center justify-center ventic-muted">
          …
        </div>
      }
    >
      <ManageSubscriptionClient />
    </Suspense>
  );
}
