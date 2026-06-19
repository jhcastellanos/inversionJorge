import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/auth';
import { ReferralTrader } from '../../../../lib/referrals';
import { sendReferralProgramEmail } from '../../../../lib/referralEmail';
import { buildReferralLink } from '../../../../lib/siteUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const traders = await ReferralTrader.findAll();
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto');

  return NextResponse.json({
    traders: traders.map((t) => ({
      ...t,
      referral_link: buildReferralLink(t.referral_code, host, protocol),
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const alias = typeof body.alias === 'string' ? body.alias.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!alias) {
      return NextResponse.json({ error: 'El alias es obligatorio' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const trader = await ReferralTrader.create({ alias, email });
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto');
    const referral_link = buildReferralLink(trader.referral_code, host, protocol);

    let emailSent = false;
    if (body.sendEmail === true) {
      try {
        await sendReferralProgramEmail(trader.email, trader.alias, referral_link);
        emailSent = true;
      } catch (emailError) {
        console.error('Referidor creado pero falló el email:', emailError);
        return NextResponse.json(
          {
            trader: { ...trader, referral_link },
            emailSent: false,
            emailError:
              emailError instanceof Error ? emailError.message : 'Error al enviar el email',
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({
      trader: { ...trader, referral_link },
      emailSent,
    });
  } catch (error) {
    console.error('Error creating referral trader:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear referidor' },
      { status: 500 }
    );
  }
}
