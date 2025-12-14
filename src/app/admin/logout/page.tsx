import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function LogoutPage() {
  cookies().delete('admin_token');
  redirect('/admin/login');
  return null;
}
