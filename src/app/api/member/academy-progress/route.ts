import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../lib/memberAuth';
import { getMemberAccess } from '../../../../lib/memberAccess';
import { PlatformUser } from '../../../../lib/platformUsers';
import {
  getCompletedLessonIds,
  markLessonComplete,
} from '../../../../lib/platformAcademyProgress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAcademyMember(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await PlatformUser.findById(session.userId);
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  const access = await getMemberAccess(user);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Sin acceso a la academia' }, { status: 403 });
  }
  return { user, access };
}

export async function GET(req: NextRequest) {
  const auth = await requireAcademyMember(req);
  if (auth instanceof NextResponse) return auth;

  const moduleId = Number(req.nextUrl.searchParams.get('moduleId'));
  const idsParam = req.nextUrl.searchParams.get('lessonIds');
  let lessonIds: number[] = [];
  if (idsParam) {
    lessonIds = idsParam
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
  }

  if (Number.isFinite(moduleId) && moduleId > 0 && lessonIds.length === 0) {
    const { pool } = await import('../../../../lib/db');
    const client = await pool.connect();
    try {
      const r = await client.query(
        `SELECT id FROM platform_academy_lessons WHERE module_id = $1 AND is_published = true`,
        [moduleId]
      );
      lessonIds = r.rows.map((row) => Number(row.id));
    } finally {
      client.release();
    }
  }

  const completedLessonIds = await getCompletedLessonIds(auth.user.id, lessonIds);
  return NextResponse.json({ completedLessonIds });
}

export async function POST(req: NextRequest) {
  const auth = await requireAcademyMember(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const lessonId = Number(body.lessonId);
  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    return NextResponse.json({ error: 'lessonId requerido' }, { status: 400 });
  }

  await markLessonComplete(auth.user.id, lessonId);
  return NextResponse.json({ ok: true });
}
