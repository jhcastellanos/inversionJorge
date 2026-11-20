import { getFirstNameFromAlias } from './referralEmail';
import { getOwnerNotifyEmails, sendResendHtmlEmail } from './resendSend';
import { getSiteBaseUrl } from './siteUrl';
import {
  ONE_ON_ONE_DURATION_MINUTES,
  ONE_ON_ONE_PRICE_USD,
  ONE_ON_ONE_TIMEZONE,
} from './oneOnOneMeetings.constants';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMeetingWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: ONE_ON_ONE_TIMEZONE,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function oneOnOneEmailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
${bodyHtml}
<p style="margin-top: 28px;">Un abrazo,<br><strong>Jorge y Guille</strong><br>Inversión Real con Jorge y Guille</p>
</body>
</html>`;
}

async function send(to: string | string[], subject: string, bodyHtml: string) {
  await sendResendHtmlEmail({ to, subject, html: oneOnOneEmailShell(bodyHtml) });
}

/** Tras crear una solicitud: correo al miembro y aviso al admin (await en API). */
export async function deliverOneOnOneNewRequestEmails(
  memberEmail: string,
  memberName: string,
  meetingStartIso: string,
  note: string,
  requestId: number
): Promise<void> {
  const results = await Promise.allSettled([
    sendOneOnOneRequestReceivedToMember(memberEmail, memberName, meetingStartIso, note),
    sendOneOnOneNewRequestToOwner(memberName, memberEmail, meetingStartIso, note, requestId),
  ]);
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error('[one-on-one] fallo al enviar email de nueva solicitud:', r.reason);
    }
  }
  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed === results.length) {
    throw new Error('No se pudo enviar ningún correo de la solicitud 1-1');
  }
}

export async function sendOneOnOneRequestReceivedToMember(
  toEmail: string,
  fullName: string,
  meetingStartIso: string,
  note: string
) {
  const name = escapeHtml(getFirstNameFromAlias(fullName));
  const when = escapeHtml(formatMeetingWhen(meetingStartIso));
  const safeNote = escapeHtml(note);
  const requestsUrl = escapeHtml(`${getSiteBaseUrl()}/reunion-1a1`);

  await send(
    toEmail,
    'Solicitud de reunión 1-a-1 recibida',
    `<p>Hola <strong>${name}</strong>,</p>
    <p>Recibimos tu solicitud de reunión 1-a-1 (${ONE_ON_ONE_DURATION_MINUTES} min, Zoom).</p>
    <p><strong>Horario solicitado:</strong> ${when}</p>
    <p><strong>Tema / nota:</strong></p>
    <p style="background:#f1f5f9;padding:12px;border-radius:8px;">${safeNote}</p>
    <p>El equipo revisará tu solicitud y te responderá en breve. Precio de la sesión: <strong>USD ${ONE_ON_ONE_PRICE_USD}</strong> (se pagará solo después de la aprobación).</p>
    <p><strong>Recuerda:</strong> la sesión dura ${ONE_ON_ONE_DURATION_MINUTES} minutos. Ven con tus dudas claras y priorizadas para aprovechar el tiempo al máximo.</p>
    <p><a href="${requestsUrl}">Ver mis solicitudes</a></p>`
  );
}

export async function sendOneOnOneNewRequestToOwner(
  memberName: string,
  memberEmail: string,
  meetingStartIso: string,
  note: string,
  requestId: number
) {
  const when = escapeHtml(formatMeetingWhen(meetingStartIso));
  const adminUrl = escapeHtml(`${getSiteBaseUrl()}/admin/reuniones-1a1`);
  await send(
    getOwnerNotifyEmails(),
    `Nueva solicitud reunión 1-1 #${requestId}`,
    `<p>Nueva solicitud de reunión 1-a-1.</p>
    <p><strong>Miembro:</strong> ${escapeHtml(memberName)} · ${escapeHtml(memberEmail)}</p>
    <p><strong>Horario:</strong> ${when}</p>
    <p><strong>Nota:</strong></p>
    <p style="background:#f1f5f9;padding:12px;border-radius:8px;">${escapeHtml(note)}</p>
    <p><a href="${adminUrl}">Abrir panel de solicitudes</a></p>`
  );
}

export async function sendOneOnOneApprovedToMember(
  toEmail: string,
  fullName: string,
  meetingStartIso: string,
  paymentDeadlineIso: string,
  requestId: number
) {
  const payUrl = escapeHtml(`${getSiteBaseUrl()}/reunion-1a1?pay=${requestId}`);
  const name = escapeHtml(getFirstNameFromAlias(fullName));
  await send(
    toEmail,
    'Tu reunión 1-a-1 fue aprobada — completa el pago',
    `<p>Hola <strong>${name}</strong>,</p>
    <p>Aprobamos tu reunión 1-a-1 para <strong>${escapeHtml(formatMeetingWhen(meetingStartIso))}</strong>.</p>
    <p>Para confirmar, completa el pago de <strong>USD ${ONE_ON_ONE_PRICE_USD}</strong> antes del <strong>${escapeHtml(formatMeetingWhen(paymentDeadlineIso))}</strong> (mínimo 3 horas antes del inicio).</p>
    <p><a href="${payUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Pagar y confirmar</a></p>`
  );
}

export async function sendOneOnOneAlternativesToMember(
  toEmail: string,
  fullName: string,
  alternatives: string[],
  adminMessage: string | null,
  requestId: number
) {
  const name = escapeHtml(getFirstNameFromAlias(fullName));
  const list = alternatives
    .map((iso) => `<li>${escapeHtml(formatMeetingWhen(iso))}</li>`)
    .join('');
  const msg = adminMessage ? `<p><strong>Mensaje del equipo:</strong> ${escapeHtml(adminMessage)}</p>` : '';
  const url = escapeHtml(`${getSiteBaseUrl()}/reunion-1a1?pick=${requestId}`);

  await send(
    toEmail,
    'Horarios alternativos para tu reunión 1-a-1',
    `<p>Hola <strong>${name}</strong>,</p>
    <p>El horario que pediste no está disponible. Te proponemos estas opciones:</p>
    <ul>${list}</ul>
    ${msg}
    <p>Elige uno en la plataforma; al confirmarlo podrás pagar directamente sin nueva revisión.</p>
    <p><a href="${url}">Elegir horario</a></p>`
  );
}

export async function sendOneOnOneCounterToOwner(
  memberName: string,
  memberEmail: string,
  meetingStartIso: string,
  clientMessage: string | null,
  requestId: number,
  originalNote: string
) {
  const when = escapeHtml(formatMeetingWhen(meetingStartIso));
  const adminUrl = escapeHtml(`${getSiteBaseUrl()}/admin/reuniones-1a1`);
  const msg = clientMessage
    ? `<p><strong>Mensaje del miembro:</strong> ${escapeHtml(clientMessage)}</p>`
    : '';
  await send(
    getOwnerNotifyEmails(),
    `Contrapropuesta reunión 1-1 #${requestId}`,
    `<p><strong>${escapeHtml(memberName)}</strong> (${escapeHtml(memberEmail)}) propone otro horario:</p>
    <p><strong>Nuevo horario solicitado:</strong> ${when}</p>
    ${msg}
    <p><strong>Tema original:</strong></p>
    <p style="background:#f1f5f9;padding:12px;border-radius:8px;">${escapeHtml(originalNote)}</p>
    <p><a href="${adminUrl}">Revisar en el panel</a></p>`
  );
}

export async function sendOneOnOneDeclinedToMember(
  toEmail: string,
  fullName: string,
  adminMessage: string | null
) {
  const name = escapeHtml(getFirstNameFromAlias(fullName));
  const url = escapeHtml(`${getSiteBaseUrl()}/reunion-1a1`);
  const msg = adminMessage
    ? `<p><strong>Mensaje del equipo:</strong> ${escapeHtml(adminMessage)}</p>`
    : '';
  await send(
    toEmail,
    'Tu solicitud de reunión 1-1 fue rechazada',
    `<p>Hola <strong>${name}</strong>,</p>
    <p>No podemos atender esta solicitud en los términos actuales.</p>
    ${msg}
    <p>Cuando quieras, puedes enviar una nueva solicitud desde la plataforma.</p>
    <p><a href="${url}">Ir a reuniones 1-1</a></p>`
  );
}

export async function sendOneOnOnePaidConfirmation(toEmail: string, fullName: string, meetingStartIso: string) {
  const name = escapeHtml(getFirstNameFromAlias(fullName));
  await send(
    toEmail,
    'Reunión 1-a-1 confirmada y pagada',
    `<p>Hola <strong>${name}</strong>,</p>
    <p>¡Gracias! Tu pago fue recibido. Reunión confirmada para <strong>${escapeHtml(formatMeetingWhen(meetingStartIso))}</strong> (${ONE_ON_ONE_DURATION_MINUTES} min).</p>
    <p>Prepara tus dudas con antelación y priorízalas: solo tenemos ${ONE_ON_ONE_DURATION_MINUTES} minutos y así aprovechamos cada minuto.</p>
    <p>Te contactaremos con el enlace de Zoom antes de la sesión.</p>`
  );
}