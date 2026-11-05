export const EMPTY = '—';
export const THIN_SPACE = ' ';

type Nullable<T> = T | null | undefined;

interface ValueOptions {
  decimals?: number;
}

const isMissing = (v: Nullable<number>): v is null | undefined =>
  v === null || v === undefined || Number.isNaN(v);

const groupThousands = (v: number, decimals: number): string => {
  const rounded = Math.abs(v).toFixed(decimals);
  const [int, dec] = rounded.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  const sign = v < 0 && Number(rounded) !== 0 ? '-' : '';
  return dec ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};

const withUnit = (text: string, unit?: string) =>
  unit ? `${text}${THIN_SPACE}${unit}` : text;

export const number = (v: Nullable<number>, options: ValueOptions = {}) =>
  isMissing(v) ? EMPTY : groupThousands(v, options.decimals ?? 0);

export const value = (
  v: Nullable<number>,
  unit?: string,
  options: ValueOptions = {},
): string => (isMissing(v) ? EMPTY : withUnit(number(v, options), unit));

export const percent = (p: Nullable<number>, options: ValueOptions = {}) =>
  value(p, '%', options);

export const minutes = (m: Nullable<number>) =>
  isMissing(m) ? EMPTY : formatMinutes(Math.max(0, Math.round(m)));

const formatMinutes = (m: number): string => {
  if (m < 60) return withUnit(String(m), 'min');
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest
    ? `${withUnit(String(h), 'h')}${THIN_SPACE}${String(rest).padStart(2, '0')}`
    : withUnit(String(h), 'h');
};

export const duration = (seconds: Nullable<number>): string => {
  if (isMissing(seconds)) return EMPTY;
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return withUnit(String(s), 's');
  if (s < 86_400) return formatMinutes(Math.floor(s / 60));
  const days = Math.floor(s / 86_400);
  const hours = Math.floor((s % 86_400) / 3600);
  return hours
    ? `${withUnit(String(days), 'j')} ${withUnit(String(hours), 'h')}`
    : withUnit(String(days), 'j');
};

export const countdown = (seconds: Nullable<number>): string => {
  if (isMissing(seconds)) return EMPTY;
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const toDate = (iso: Nullable<string | Date>): Date | null => {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const pad = (n: number) => String(n).padStart(2, '0');

export const clock = (iso: Nullable<string | Date>): string => {
  const d = toDate(iso);
  return d
    ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : EMPTY;
};

export const date = (iso: Nullable<string | Date>): string => {
  const d = toDate(iso);
  return d
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    : EMPTY;
};

export const since = (
  iso: Nullable<string | Date>,
  now: number = Date.now(),
): string => {
  const d = toDate(iso);
  if (!d) return EMPTY;
  return duration(Math.max(0, (now - d.getTime()) / 1000));
};

export const fmt = {
  value,
  number,
  percent,
  minutes,
  duration,
  countdown,
  clock,
  date,
  since,
};
