import { Resend } from 'resend';
import { getFirstNameFromAlias } from './referralEmail';
import { getSiteBaseUrl } from './siteUrl';
import {
  ONE_ON_ONE_DURATION_MINUTES,
  ONE_ON_ONE_PRICE_USD,
  ONE_ON_ONE_TIMEZONE,
} from './oneOnOneMeetings.constants';

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    'Inversión Real con Jorge y Guille <inversionrealconjorge@gmail.com>'
  );
}

function ownerEmail(): string {
  return process.env.OWNER_EMAIL || 'inversionrealconjorge@gmail.com';
}

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

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada; omitiendo email 1-a-1');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await resend.emails.send({
    from: getFromAddress(),
    to: to.trim().toLowerCase(),
    subject,
    html,
  });
  if (response.error) throw new Error(JSON.stringify(response.error));
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
    ownerEmail(),
    `Nueva solicitud reunión 1-a-1 #${requestId}`,
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

export async function sendOneOnOnePaidConfirmation(toEmail: string, fullName: string, meetingStartIso: string) {
  const name = escapeHtml(getFirstNameFromAlias(fullName));
  await send(
    toEmail,
    'Reunión 1-a-1 confirmada y pagada',
    `<p>Hola <strong>${name}</strong>,</p>
    <p>¡Gracias! Tu pago fue recibido. Reunión confirmada para <strong>${escapeHtml(formatMeetingWhen(meetingStartIso))}</strong> (${ONE_ON_ONE_DURATION_MINUTES} min).</p>
    <p>Te contactaremos con el enlace de Zoom antes de la sesión.</p>`
  );
}