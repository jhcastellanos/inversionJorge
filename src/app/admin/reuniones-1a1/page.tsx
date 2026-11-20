import AdminPageWrapper from '../../../components/AdminPageWrapper';
import AdminOneOnOnePanel from '../../../components/oneOnOne/AdminOneOnOnePanel';
import { ONE_ON_ONE_PRICE_USD } from '../../../lib/oneOnOneMeetings.constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminReunionesOneOnOnePage() {
  return (
    <AdminPageWrapper active="one-on-one">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reuniones 1-1</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Aprueba horarios, propón alternativas o rechaza. El pago (USD {ONE_ON_ONE_PRICE_USD}) solo después de aprobar o de que el
          cliente elija un horario alternativo.
        </p>
        <AdminOneOnOnePanel />
      </main>
    </AdminPageWrapper>
  );
}