import { en } from './messages/en';
import { es, type Messages } from './messages/es';

export type Locale = 'es' | 'en';

const catalogs: Record<Locale, Messages> = { es, en };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? es;
}

type Path = keyof Messages | `${keyof Messages}.${string}`;

function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : path;
}

export function translate(locale: Locale, key: string): string {
  return resolve(getMessages(locale) as unknown as Record<string, unknown>, key);
}
