export type OneOnOneStatus =
  | 'pending_admin'
  | 'awaiting_payment'
  | 'awaiting_client_slot'
  | 'paid'
  | 'declined'
  | 'expired'
  | 'cancelled';

export function oneOnOneStatusLabel(status: OneOnOneStatus): string {
  const labels: Record<OneOnOneStatus, string> = {
    pending_admin: 'Pendiente de revisión',
    awaiting_payment: 'Aprobada — completa el pago',
    awaiting_client_slot: 'Elige un horario alternativo',
    paid: 'Confirmada y pagada',
    declined: 'No disponible',
    expired: 'Plazo de pago vencido',
    cancelled: 'Cancelada',
  };
  return labels[status] ?? status;
}