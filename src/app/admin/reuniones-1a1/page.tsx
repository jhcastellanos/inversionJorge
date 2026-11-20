import { redirect } from 'next/navigation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminReunionesOneOnOnePage() {
  redirect('/app/gestionar-reuniones-1a1');
}