export default function ContactSupportRoleBanner() {
  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-semibold text-amber-200">Membresía activa detectada</p>
      <p className="mt-1 text-amber-100/90">
        Tu rol actual es <strong>Estudiante</strong>. Contacta a soporte para que actualicen tu rol
        (Trader, Inversor, etc.) según tu plan en el sistema.
      </p>
    </div>
  );
}
