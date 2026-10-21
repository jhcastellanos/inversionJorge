import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/auth';
import { PlatformUser } from '../../../../lib/platformUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await PlatformUser.findAll();
  return NextResponse.json({ users });
}
