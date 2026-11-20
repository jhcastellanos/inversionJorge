import { Resend } from 'resend';

/** Remitente verificado en Resend (dominio propio). Sin EMAIL_FROM, Resend solo entrega a la cuenta dueña del API key. */
export function getResendFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.REFERRAL_EMAIL_FROM ||
    'Inversión Real con Jorge y Guille <onboarding@resend.dev>'
  );
}

export function getOwnerNotifyEmails(): string[] {
  const raw =
    process.env.OWNER_EMAIL ||
    process.env.ADMIN_NOTIFY_EMAIL ||
    'inversionrealconjorge@gmail.com';
  const emails = raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes('@'));
  return emails.length > 0 ? emails : ['inversionrealconjorge@gmail.com'];
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendResendHtmlEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<string | undefined> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error('RESEND_API_KEY no configurada');
  }

  const resend = new Resend(key);
  const toList = (Array.isArray(params.to) ? params.to : [params.to]).map((e) =>
    e.trim().toLowerCase()
  );

  const response = await resend.emails.send({
    from: getResendFromAddress(),
    to: toList.length === 1 ? toList[0] : toList,
    subject: params.subject,
    html: params.html,
  });

  if (response.error) {
    throw new Error(`Resend: ${JSON.stringify(response.error)}`);
  }

  const id = response.data?.id;
  console.log(`[resend] OK "${params.subject}" → ${toList.join(', ')} (${id ?? 'no-id'})`);
  return id;
}