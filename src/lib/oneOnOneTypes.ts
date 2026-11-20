import { ONE_ON_ONE_DURATION_MINUTES } from './oneOnOneMeetings.constants';

export type OneOnOneStatus =
  | 'pending_admin'
  | 'awaiting_payment'
  | 'awaiting_client_slot'
  | 'paid'
  | 'declined'
  | 'expired'
  | 'cancelled';

/** Mientras sea true, el miembro no puede abrir otra solicitud nueva. */
export function oneOnOneRequestBlocksNewBooking(
  status: OneOnOneStatus,
  meetingStartAt: string | Date
): boolean {
  if (status === 'declined' || status === 'expired' || status === 'cancelled') {
    return false;
  }
  if (status === 'paid') {
    const start = new Date(meetingStartAt).getTime();
    const sessionEnd = start + ONE_ON_ONE_DURATION_MINUTES * 60 * 1000;
    return Date.now() < sessionEnd;
  }
  return true;
}

export function oneOnOneMemberNeedsAction(status: OneOnOneStatus): boolean {
  return status === 'awaiting_client_slot' || status === 'awaiting_payment';
}

export function oneOnOneStatusLabel(status: OneOnOneStatus): string {
  const labels: Record<OneOnOneStatus, string> = {
    pending_admin: 'Pendiente de revisión',
    awaiting_payment: 'Aprobada — completa el pago',
    awaiting_client_slot: 'El equipo propuso horarios — tu respuesta',
    paid: 'Confirmada y pagada',
    declined: 'No disponible',
    expired: 'Plazo de pago vencido',
    cancelled: 'Cancelada',
  };
  return labels[status] ?? status;
}