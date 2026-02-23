import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Force rebuild - using built-in Courier fonts for Vercel compatibility

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
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      
      const doc = new PDFDocument({
        bufferPages: false,
        margin: 30,
        size: 'A4',
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      // Simple PDF with basic text
      doc.fontSize(16).text('TERMINOS Y CONDICIONES', { align: 'center' });
      doc.fontSize(12).text('Trading en Vivo con Jorge y Guille', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Fecha: ${acceptanceDate.toLocaleDateString('es-ES')}`);
      
      doc.moveDown(0.5);
      doc.fontSize(11).text('INFORMACION DEL SUSCRIPTOR:');
      doc.fontSize(10).text(`Nombre: ${customerName}`);
      doc.fontSize(10).text(`Email: ${customerEmail}`);
      
      doc.moveDown(1);
      doc.fontSize(10).text('TERMINOS Y CONDICIONES RESUMIDOS:', { underline: true });
      
      // Add simplified terms
      doc.fontSize(9);
      const shortTerms = `El usuario acepta que:
- Este servicio es informativo y demostrativo
- El trading conlleva alto riesgo de perdida
- Las decisiones son responsabilidad del usuario
- No hay garantia de ganancias
- Puede cancelar en cualquier momento
- El acceso se mantiene hasta fin del periodo pagado

Fecha de aceptacion: ${acceptanceDate.toLocaleString('es-ES')}

Este documento fue generado automaticamente y tiene validez legal como contrato electronico.`;
      doc.text(shortTerms);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function sendEmail(
  to: string,
  customerName: string,
  customerEmail: string,
  pdfBuffer: Buffer
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const attachmentBase64 = pdfBuffer.toString('base64');
  
  const response = await resend.emails.send({
    from: 'Inversión Real <onboarding@resend.dev>',
    to: to,
    subject: `Contrato Firmado - Trading en Vivo: ${customerName}`,
    html: `
      <h2>Nuevo Contrato de Membresía Aceptado</h2>
      <p><strong>Suscriptor:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
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
    const { customerName, customerEmail, membershipName } = await req.json();

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateTermsPDF(customerName, customerEmail, new Date());

    // Send email
    await sendEmail(
      process.env.OWNER_EMAIL || 'inversionrealconjorge@gmail.com',
      customerName,
      customerEmail,
      pdfBuffer
    );

    return NextResponse.json({
      success: true,
      message: 'Terms accepted and email sent',
    });
  } catch (error) {
    console.error('Error generating or sending terms PDF:', error);
    return NextResponse.json(
      {
        error: 'Error processing terms',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
