'use client';

import { useEffect, useMemo, useState } from 'react';
import { ONE_ON_ONE_TIMEZONE_LABEL } from '../../lib/oneOnOneMeetings.constants';
import {
  floridaDateKey,
  floridaDayHeader,
  floridaTimeLabel,
  groupSlotsByFloridaDate,
} from '../../lib/oneOnOneSlotDisplay';

type Slot = { startAt: string; label: string };

export default function OneOnOneSlotPicker({
  slots,
  selected,
  onSelect,
}: {
  slots: Slot[];
  selected: string;
  onSelect: (startAt: string) => void;
}) {
  const byDate = useMemo(() => groupSlotsByFloridaDate(slots), [slots]);
  const dateKeys = useMemo(() => Array.from(byDate.keys()).sort(), [byDate]);

  const [activeDate, setActiveDate] = useState<string>('');

  useEffect(() => {
    if (dateKeys.length === 0) {
      setActiveDate('');
      return;
    }
    if (selected) {
      const key = floridaDateKey(selected);
      if (dateKeys.includes(key)) {
        setActiveDate(key);
        return;
      }
    }
    if (!activeDate || !dateKeys.includes(activeDate)) {
      setActiveDate(dateKeys[0]);
    }
  }, [dateKeys, selected, activeDate]);

  const timesForDay = activeDate ? byDate.get(activeDate) ?? [] : [];

  if (slots.length === 0) {
    return (
      <p className="text-sm ventic-muted">No hay horarios disponibles en las próximas semanas.</p>
    );
  }

  return (
    <div className="rounded-xl border ventic-border overflow-hidden bg-black/20">
      <div className="px-4 py-3 border-b ventic-border flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium ventic-text">Selecciona día y hora</p>
        <span className="text-xs ventic-muted">{ONE_ON_ONE_TIMEZONE_LABEL}</span>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] min-h-[280px]">
        <div className="border-b md:border-b-0 md:border-r ventic-border p-3 max-h-[320px] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider ventic-muted mb-2 px-1">
            Fecha
          </p>
          <ul className="space-y-1">
            {dateKeys.map((key) => {
              const sample = byDate.get(key)?.[0];
              if (!sample) return null;
              const { weekday, dayNum, month } = floridaDayHeader(sample.startAt);
              const active = key === activeDate;
              const count = byDate.get(key)?.length ?? 0;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setActiveDate(key)}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-[var(--ventic-accent)] text-white shadow-sm'
                        : 'hover:bg-ventic-accent-soft ventic-text'
                    }`}
                  >
                    <span className="flex flex-col">
                      <span
                        className={`text-xs uppercase tracking-wide ${active ? 'text-white/80' : 'ventic-muted'}`}
                      >
                        {weekday}
                      </span>
                      <span className="text-sm font-semibold">
                        {dayNum} {month}
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                        active ? 'bg-white/20' : 'bg-white/5 ventic-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-3 max-h-[320px] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider ventic-muted mb-2 px-1">
            Hora
          </p>
          {timesForDay.length === 0 ? (
            <p className="text-sm ventic-muted px-1">Elige un día con horarios.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timesForDay.map((slot) => {
                const active = selected === slot.startAt;
                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() => onSelect(slot.startAt)}
                    className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'border-[var(--ventic-accent)] bg-[var(--ventic-accent)] text-white shadow-md'
                        : 'border-[var(--ventic-accent)]/45 text-[var(--ventic-accent)] hover:bg-[var(--ventic-accent)]/10'
                    }`}
                  >
                    {floridaTimeLabel(slot.startAt)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <div className="px-4 py-2.5 border-t ventic-border bg-ventic-accent-soft/40 text-sm ventic-text">
          <span className="ventic-muted">Seleccionado: </span>
          <strong>
            {formatSelectedSummary(selected)}
          </strong>
        </div>
      ) : null}
    </div>
  );
}

function formatSelectedSummary(iso: string): string {
  const { weekday, dayNum, month } = floridaDayHeader(iso);
  const time = floridaTimeLabel(iso);
  return `${weekday} ${dayNum} ${month}, ${time} (${ONE_ON_ONE_TIMEZONE_LABEL})`;
}