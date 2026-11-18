import { NextRequest, NextResponse } from 'next/server';
import { getStaffFromRequest } from '../../../../lib/staffAccess';
import { createPresignedPutUrl, getR2Config, sanitizeStorageKey } from '../../../../lib/r2Storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const PDF_TYPES = new Set(['application/pdf']);

const MAX_PDF_BYTES = 30 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

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

/** Devuelve URL firmada PUT para subida directa del navegador a Cloudflare R2. */
export async function POST(req: NextRequest) {
  const staff = await requireAcademyUploadStaff(req);
  if (staff instanceof NextResponse) return staff;

  if (!getR2Config()) {
    return NextResponse.json(
      { error: 'Almacenamiento R2 no configurado en el servidor' },
      { status: 503 }
    );
  }

  let body: {
    pathname?: string;
    contentType?: string;
    kind?: string;
    fileSize?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
  }

  const kind = body.kind === 'pdf' ? 'pdf' : 'video';
  const contentType = typeof body.contentType === 'string' ? body.contentType : '';
  const fileSize = typeof body.fileSize === 'number' ? body.fileSize : 0;

  if (kind === 'pdf' && !PDF_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Tipo PDF no permitido' }, { status: 400 });
  }
  if (kind === 'video' && !VIDEO_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Tipo de video no permitido' }, { status: 400 });
  }

  const maxSize = kind === 'pdf' ? MAX_PDF_BYTES : MAX_VIDEO_BYTES;
  if (fileSize > maxSize) {
    return NextResponse.json({ error: 'Archivo demasiado grande' }, { status: 400 });
  }

  const pathname = typeof body.pathname === 'string' ? body.pathname : '';
  const key = sanitizeStorageKey('academy', pathname);
  if (!key) {
    return NextResponse.json({ error: 'Ruta de archivo inválida' }, { status: 400 });
  }

  try {
    const { uploadUrl, fileUrl } = await createPresignedPutUrl(key, contentType);
    return NextResponse.json({ uploadUrl, fileUrl, key });
  } catch (error) {
    console.error('Academy R2 presign error:', error);
    return NextResponse.json({ error: 'No se pudo preparar la subida' }, { status: 500 });
  }
}