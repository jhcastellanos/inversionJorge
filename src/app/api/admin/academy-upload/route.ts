import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireStaffApi } from '../../../../lib/staffAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const PDF_TYPES = ['application/pdf'];

export async function POST(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const kind = formData.get('kind') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const isVideo = VIDEO_TYPES.includes(file.type) || kind === 'video';
    const isPdf = PDF_TYPES.includes(file.type) || kind === 'pdf';

    if (!isVideo && !isPdf) {
      return NextResponse.json({ error: 'Solo video (mp4/webm) o PDF' }, { status: 400 });
    }

    const max = isVideo ? 200 * 1024 * 1024 : 30 * 1024 * 1024;
    if (file.size > max) {
      return NextResponse.json(
        { error: isVideo ? 'Video máx 200MB' : 'PDF máx 30MB' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() ?? (isPdf ? 'pdf' : 'mp4');
    const filename = `academy-${Date.now()}.${ext}`;
    const blob = await put(filename, file, { access: 'public' });

    return NextResponse.json({
      url: blob.url,
      file_size_bytes: file.size,
    });
  } catch (error) {
    console.error('Academy upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
