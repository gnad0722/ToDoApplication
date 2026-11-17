import { format, formatDistanceToNowStrict, isPast, isToday, isTomorrow, isValid, parseISO } from 'date-fns';

export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

/** "Nov 18, 2026 · 09:00" */
export function formatDateTime(value?: string | null, fallback = '—'): string {
  const d = parseDate(value);
  return d ? format(d, 'MMM d, yyyy · HH:mm') : fallback;
}

export function formatDate(value?: string | null, fallback = '—'): string {
  const d = parseDate(value);
  return d ? format(d, 'MMM d, yyyy') : fallback;
}

/** Friendly label: "Today 09:00", "Tomorrow 14:30" or "Nov 20 · 08:00". */
export function formatRelativeDay(value?: string | null, fallback = 'No time set'): string {
  const d = parseDate(value);
  if (!d) return fallback;
  if (isToday(d)) return `Today ${format(d, 'HH:mm')}`;
  if (isTomorrow(d)) return `Tomorrow ${format(d, 'HH:mm')}`;
  return format(d, 'MMM d · HH:mm');
}

export function fromNow(value?: string | null): string {
  const d = parseDate(value);
  return d ? formatDistanceToNowStrict(d, { addSuffix: true }) : '';
}

export function isOverdue(value?: string | null): boolean {
  const d = parseDate(value);
  return !!d && isPast(d);
}

/** Backend date-time (ISO) -> value for <input type="datetime-local">. */
export function toInputDateTime(value?: string | null): string {
  const d = parseDate(value);
  return d ? format(d, "yyyy-MM-dd'T'HH:mm") : '';
}

/**
 * <input type="datetime-local"> value -> backend date-time.
 * Sends a local date-time without offset ("2026-11-18T09:00:00"), which maps to
 * Java LocalDateTime. If the backend uses Instant/OffsetDateTime, switch this to
 * `new Date(value).toISOString()`. This is the only place to change.
 */
export function toApiDateTime(value?: string | null): string | null {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}
