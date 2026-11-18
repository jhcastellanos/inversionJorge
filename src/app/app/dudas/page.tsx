import MemberSupportPanel from '../../../components/support/MemberSupportPanel';

export default function AppDudasPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold ventic-text mb-1">Dudas e inquietudes</h1>
      <p className="text-sm ventic-muted mb-6">
        Historial privado de tus mensajes al equipo. Aquí verás si leímos tu consulta y nuestra respuesta.
      </p>
      <MemberSupportPanel />
    </div>
  );
}