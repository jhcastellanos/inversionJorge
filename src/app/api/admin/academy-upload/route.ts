import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { getStaffFromRequest } from '../../../../lib/staffAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const PDF_TYPES = ['application/pdf'];

async function requireAcademyUploadStaff(req: NextRequest) {
  const staff = await getStaffFromRequest(req);
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!staff.capabilities.canManagePlatformContent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return staff;
}

/** Client upload token + completion (evita límite ~4.5MB del body en serverless). */
export async function POST(req: NextRequest) {
  const staff = await requireAcademyUploadStaff(req);
  if (staff instanceof NextResponse) return staff;

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      {
        error:
          'Subida directa deshabilitada para archivos grandes. Recarga la página e intenta de nuevo (subida desde el navegador).',
      },
      { status: 400 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const kind = clientPayload === 'pdf' ? 'pdf' : 'video';
        const maximumSizeInBytes = kind === 'pdf' ? 30 * 1024 * 1024 : 200 * 1024 * 1024;
        return {
          allowedContentTypes: kind === 'pdf' ? PDF_TYPES : VIDEO_TYPES,
          maximumSizeInBytes,
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Academy client upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
