import { NextResponse } from 'next/server';
import { listBookableSlots } from '../../../../../lib/oneOnOneSlots';
import { OneOnOneRequest, ensureOneOnOneSchema } from '../../../../../lib/oneOnOneMeetings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureOneOnOneSchema();
  const slots = listBookableSlots();
  const taken = new Set<string>();

  for (const slot of slots) {
    if (await OneOnOneRequest.isSlotTaken(new Date(slot.startAt))) {
      taken.add(slot.startAt);
    }
  }

  const available = slots.filter((s) => !taken.has(s.startAt));
  return NextResponse.json({ slots: available, durationMinutes: 40, priceUsd: 100 });
}