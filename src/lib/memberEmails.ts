import { Resend } from 'resend';
import { DISCORD_INVITE_URL } from './communityLinks';
import { getFirstNameFromAlias } from './referralEmail';
import { getSiteBaseUrl } from './siteUrl';

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    'Inversión Real con Jorge y Guille <inversionrealconjorge@gmail.com>'
  );
}

function getSupportContactEmail(): string {
  return process.env.OWNER_EMAIL || 'inversionrealconjorge@gmail.com';
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function memberEmailShell(firstName: string, bodyHtml: string): string {
  const safeName = escapeHtml(firstName);
  const discordUrl = escapeHtml(DISCORD_INVITE_URL);
  const connectDiscord = escapeHtml(`${getSiteBaseUrl()}/conectar-discord`);
  const supportEmail = escapeHtml(getSupportContactEmail());
  const dudasUrl = escapeHtml(`${getSiteBaseUrl()}/dudas`);

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p>Hola <strong>${safeName}</strong>,</p>
  ${bodyHtml}
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
  <p><strong>Discord (obligatorio para la comunidad)</strong></p>
  <p>Conecta tu cuenta de Discord con la plataforma y únete al servidor:</p>
  <ul>
    <li><a href="${connectDiscord}" style="color: #1e40af;">Vincular Discord en la plataforma</a></li>
    <li><a href="${discordUrl}" style="color: #1e40af;">Invitación al servidor de Discord</a></li>
  </ul>
  <p>Cualquier duda, escríbenos a <a href="mailto:${supportEmail}" style="color: #1e40af;">${supportEmail}</a> o deja un mensaje en <a href="${dudasUrl}" style="color: #1e40af;">Dudas e inquietudes</a> dentro de tu cuenta.</p>
  <p>Un abrazo,<br><strong>Jorge y Guille</strong><br>Inversión Real con Jorge y Guille</p>
</body>
</html>`;
}

export async function sendMemberWelcomeEmail(toEmail: string, fullName: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada; omitiendo email de bienvenida');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const firstName = getFirstNameFromAlias(fullName);
  const html = memberEmailShell(
    firstName,
    `
  <p>¡Gracias por crear tu cuenta en <strong>Inversión Real con Jorge y Guille</strong>!</p>
  <p>Estamos felices de tenerte con nosotros. Para aprovechar la membresía y la comunidad, recuerda vincular Discord y, cuando estés listo, revisar los planes disponibles.</p>
  `
  );

  const response = await resend.emails.send({
    from: getFromAddress(),
    to: toEmail.trim().toLowerCase(),
    subject: 'Bienvenido/a a Inversión Real con Jorge y Guille',
    html,
  });

  if (response.error) {
    throw new Error(`Welcome email: ${JSON.stringify(response.error)}`);
  }
}

export async function sendMemberSubscriptionThankYouEmail(
  toEmail: string,
  fullName: string,
  membershipName?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada; omitiendo email post-suscripción');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const firstName = getFirstNameFromAlias(fullName);
  const planLine = membershipName
    ? `<p>Tu plan: <strong>${escapeHtml(membershipName)}</strong>.</p>`
    : '';

  const html = memberEmailShell(
    firstName,
    `
  <p>¡Gracias por suscribirte a <strong>Inversión Real con Jorge y Guille</strong>!</p>
  ${planLine}
  <p>Recibirás también el contrato de membresía por correo. Mientras tanto, asegúrate de tener Discord vinculado para acceder a la comunidad y al contenido en vivo.</p>
  `
  );

  const response = await resend.emails.send({
    from: getFromAddress(),
    to: toEmail.trim().toLowerCase(),
    subject: 'Gracias por tu suscripción – Inversión Real',
    html,
  });

  if (response.error) {
    throw new Error(`Subscription thank-you email: ${JSON.stringify(response.error)}`);
  }
}