import { Resend } from 'resend';

const REFERRAL_EMAIL_SUBJECT =
  'Programa de referidos – gana beneficios por traer traders a Inversión Real con Jorge y Guille';

function getReferralFromAddress(): string {
  return (
    process.env.REFERRAL_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    'Inversión Real con Jorge y Guille <inversionrealconjorge@gmail.com>'
  );
}

/** First token of alias, title-cased for greeting. */
export function getFirstNameFromAlias(alias: string): string {
  const trimmed = alias.trim();
  if (!trimmed) return 'Trader';
  const first = trimmed.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function buildReferralProgramEmailHtml(firstName: string, referralLink: string): string {
  const safeName = firstName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeLink = referralLink.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p>Hola <strong>${safeName}</strong>,</p>

  <p>Esperamos que estés disfrutando tu experiencia con nosotros en <strong>Inversión Real con Jorge y Guille</strong>.</p>

  <p>Queremos contarte algo que hemos preparado especialmente para traders como tú: nuestro <strong>Programa de Referidos</strong>.</p>

  <p>La idea es sencilla: si conoces a alguien que quiera aprender a operar en los mercados con acompañamiento real, tú puedes recomendarle nuestra membresía, y <strong>tú también ganas por ello</strong>.</p>

  <h3 style="color: #1e3a8a; margin-top: 24px;">¿Cómo funciona?</h3>
  <ol>
    <li>Compartes tu enlace o código personal de referido.</li>
    <li>La persona se inscribe en una membresía.</li>
    <li>Cuando su suscripción se confirma, tú recibes tu beneficio según el plan contratado.</li>
  </ol>

  <p><strong>Tu enlace personalizado es:</strong></p>
  <p style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; word-break: break-all;">
    <a href="${safeLink}" style="color: #1e40af;">${safeLink}</a>
  </p>

  <h3 style="color: #1e3a8a; margin-top: 24px;">¿Qué ganas tú?</h3>
  <ul>
    <li>Comisión o beneficio por cada referido que se suscriba a una membresía activa.</li>
    <li>Acceso prioritario a novedades, promociones y contenido exclusivo para referidores.</li>
  </ul>

  <h3 style="color: #1e3a8a; margin-top: 24px;">¿Qué gana la persona que refieres?</h3>
  <ul>
    <li>Acceso a trading en vivo con nosotros.</li>
    <li>Clases grabadas y, según el plan, clases en vivo y material educativo nuevo.</li>
    <li>Acompañamiento real, no solo teoría.</li>
    <li>La confianza de entrar recomendado por alguien que ya está dentro del proceso.</li>
  </ul>

  <h3 style="color: #1e3a8a; margin-top: 24px;">¿A quién puedes referir?</h3>
  <p>A cualquier persona interesada en:</p>
  <ul>
    <li>Aprender a operar en bolsa y mercados financieros.</li>
    <li>Mejorar su disciplina y estrategia como trader.</li>
    <li>Recibir acompañamiento en vivo y educación práctica.</li>
    <li>Estructurar mejor su plan de inversión y portafolio.</li>
  </ul>

  <h3 style="color: #1e3a8a; margin-top: 24px;">Importante</h3>
  <p>Este programa está pensado para <strong>traders serios</strong> que quieren ayudar a otros a crecer, no para spam ni promesas irreales. Nos interesa traer personas comprometidas, no solo clics.</p>

  <p>Gracias por ser parte de <strong>Inversión Real con Jorge y Guille</strong>.<br>
  Seguimos construyendo una comunidad de traders que aprenden, operan y crecen juntos.</p>

  <p>Un abrazo,</p>
  <p><strong>Jorge y Guille</strong><br>
  Inversión Real con Jorge y Guille</p>
</body>
</html>`;
}

export async function sendReferralProgramEmail(
  toEmail: string,
  alias: string,
  referralLink: string
): Promise<{ id?: string }> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no está configurada');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const firstName = getFirstNameFromAlias(alias);
  const html = buildReferralProgramEmailHtml(firstName, referralLink);

  const response = await resend.emails.send({
    from: getReferralFromAddress(),
    to: toEmail.trim().toLowerCase(),
    subject: REFERRAL_EMAIL_SUBJECT,
    html,
  });

  if (response.error) {
    throw new Error(`Error al enviar email: ${JSON.stringify(response.error)}`);
  }

  return { id: response.data?.id };
}
