import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default function LogoutPage() {
  cookies().set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  redirect('/admin/login');
}
