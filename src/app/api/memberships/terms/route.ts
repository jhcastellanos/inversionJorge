import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TERMS_TEXT = `TÉRMINOS Y CONDICIONES
Trading en Vivo con Jorge y Guille

Última actualización: 1ro de Febrero de 2026

Al suscribirse a la membresía "Trading en Vivo con Jorge y Guille", el usuario acepta expresamente los siguientes Términos y Condiciones.

1. NATURALEZA DEL SERVICIO

La membresía "Trading en Vivo con Jorge y Guille" es un servicio de acceso a sesiones de trading en tiempo real dentro de la comunidad privada de Discord Inversión Real.

Este servicio consiste exclusivamente en:
- Transmisión en vivo de operativas realizadas por los hosts
- Comentarios en tiempo real sobre decisiones propias de mercado
- Acceso a canal de chat durante la sesión

Este servicio NO constituye:
- Asesoría financiera personalizada
- Recomendación individual de inversión
- Gestión de portafolio
- Servicio de brokeraje
- Promesa de rentabilidad

2. DECLARACIÓN DE RIESGO

El usuario reconoce y acepta que:
- Operar en mercados financieros, incluyendo opciones, conlleva alto riesgo
- Puede perder parcial o totalmente el capital invertido
- El desempeño pasado NO garantiza resultados futuros
- Las decisiones tomadas durante la sesión son responsabilidad exclusiva del usuario
- Los hosts no garantizan resultados ni porcentajes de ganancia

El usuario declara que:
- Tiene conocimiento previo de opciones financieras
- Opera bajo su propio criterio
- Es mayor de edad y legalmente capaz de contratar

3. NO RELACIÓN DE ASESORÍA PERSONAL

Jorge y Guille no actúan como:
- Asesores financieros registrados
- Investment Advisors
- Broker-Dealers
- Fiduciarios del usuario

Las sesiones son de carácter informativo y demostrativo.
Cada usuario ejecuta sus operaciones bajo su propia responsabilidad.

4. LIMITACIÓN DE RESPONSABILIDAD

Bajo ninguna circunstancia Jorge, Guille ni la comunidad Inversión Real serán responsables por:
- Pérdidas financieras
- Daños directos o indirectos
- Decisiones tomadas por el usuario
- Fallas técnicas de Discord o plataformas de terceros
- Errores de ejecución del broker del usuario

La responsabilidad total, en cualquier caso, estará limitada al monto pagado por el mes activo de membresía.

5. ALCANCE DEL SERVICIO

El usuario acepta que:
- Este espacio está enfocado en operativa en vivo
- Se utilizará lenguaje técnico propio del trading
- No se detendrá la sesión para explicar conceptos básicos
- Se recomienda tener conocimientos previos de opciones antes de suscribirse

6. FACTURACIÓN Y PAGOS

- La membresía es mensual
- El pago es recurrente
- No existen reembolsos por días no utilizados
- Al cancelar, el usuario mantiene acceso hasta el final del ciclo activo
- Es responsabilidad del usuario cancelar antes del próximo ciclo si no desea continuar

7. CONDUCTA DEL USUARIO

El usuario acepta:
- Mantener respeto dentro del chat
- No interrumpir el orden del lobby
- No difundir información privada
- No grabar, redistribuir o revender el contenido sin autorización
- Cualquier conducta inapropiada podrá resultar en expulsión sin derecho a reembolso

8. PROPIEDAD INTELECTUAL

Todo el contenido transmitido (Estrategias, Comentarios, Análisis, Metodologías, Marca) son propiedad exclusiva de los hosts.

Queda prohibida su reproducción o redistribución sin autorización escrita.

9. CUMPLIMIENTO REGULATORIO

El usuario entiende que:
- El servicio no constituye oferta pública de valores
- No se están vendiendo instrumentos financieros
- Se trata de un espacio privado de acceso por membresía
- El usuario es responsable de cumplir con las regulaciones de su país o jurisdicción

10. ACEPTACIÓN EXPRESA

Al suscribirse, el usuario declara que:
- Ha leído completamente estos Términos
- Comprende los riesgos
- Acepta operar bajo su propia responsabilidad
- Libera a los hosts de cualquier reclamo futuro relacionado con pérdidas financieras

NOTA IMPORTANTE: Aunque se use el nombre de otra persona en la compra, es quien utilizaremos como firmante y responsable de este contrato. La persona que opere con ese pseudónimo no tiene derecho de reclamación al no tener nada firmado.`;

async function generateTermsPDF(
  customerName: string,
  customerEmail: string,
  acceptanceDate: Date
): Promise<Buffer> {
  const doc = new jsPDF();
  let yPosition = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;

  // Title
  doc.setFontSize(16);
  doc.text('TERMINOS Y CONDICIONES', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(12);
  doc.text('Trading en Vivo con Jorge y Guille', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Subscriber info
  doc.setFontSize(10);
  doc.text(`Fecha: ${acceptanceDate.toLocaleDateString('es-ES')}`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.text('INFORMACION DEL SUSCRIPTOR:', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.text(`Nombre: ${customerName}`, margin, yPosition);
  yPosition += 6;
  
  doc.text(`Email: ${customerEmail}`, margin, yPosition);
  yPosition += 12;

  // Full Terms
  doc.setFontSize(10);
  doc.text('TERMINOS Y CONDICIONES COMPLETOS:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  const lines = doc.splitTextToSize(TERMS_TEXT, maxWidth);
  
  // Add terms with page breaks
  for (let i = 0; i < lines.length; i++) {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(lines[i], margin, yPosition);
    yPosition += 4;
  }

  // Add acceptance info at the end
  if (yPosition > pageHeight - margin - 20) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(9);
  yPosition += 5;
  doc.text(`Fecha de aceptacion: ${acceptanceDate.toLocaleString('es-ES')}`, margin, yPosition);
  yPosition += 6;
  doc.text(
    'Este documento fue generado automaticamente y tiene validez legal como contrato electronico firmado digitalmente.',
    margin,
    yPosition,
    { maxWidth: maxWidth }
  );

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

async function sendEmail(
  to: string,
  customerName: string,
  customerEmail: string,
  pdfBuffer: Buffer
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const attachmentBase64 = pdfBuffer.toString('base64');
  
  // Use verified owner email (test mode restriction in Resend)
  // Customer email is only for the PDF contract, not for sending
  const recipientEmail = 'jhcastellanosvilla@gmail.com';
  
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: recipientEmail,
    subject: `Nuevo Contrato Firmado - Trading en Vivo: ${customerName}`,
    html: `
      <h2>Nuevo Contrato de Membresía Aceptado</h2>
      <p><strong>Suscriptor:</strong> ${customerName}</p>
      <p><strong>Email del Suscriptor:</strong> ${customerEmail}</p>
      <p><strong>Membresía:</strong> Trading en Vivo con Jorge y Guille</p>
      <p><strong>Fecha de Aceptación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      <p>Se adjunta el contrato firmado digitalmente con los Términos y Condiciones aceptados.</p>
    `,
    attachments: [
      {
        filename: `Contrato_${customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        content: attachmentBase64,
      },
    ],
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerEmail, membershipName, stripeSubscriptionId } = await req.json();

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If stripeSubscriptionId is provided, this is being called AFTER payment
    // Generate PDF and send email
    if (stripeSubscriptionId) {
      const pdfBuffer = await generateTermsPDF(customerName, customerEmail, new Date());

      await sendEmail(
        'jhcastellanosvilla@gmail.com',
        customerName,
        customerEmail,
        pdfBuffer
      );

      return NextResponse.json({
        success: true,
        message: 'PDF generated and email sent after payment',
      });
    }

    // If no stripeSubscriptionId, this is being called BEFORE payment
    // Just validate the terms acceptance
    return NextResponse.json({
      success: true,
      message: 'Terms accepted, proceed to payment',
    });
  } catch (error) {
    console.error('Error processing terms:', error);
    return NextResponse.json(
      {
        error: 'Error processing terms',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
