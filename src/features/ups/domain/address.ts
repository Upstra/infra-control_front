import { ipOrHostnameRegex, ipv4Regex } from '@/utils/regex';

const URL_PATTERN = /^https?:\/\/[a-zA-Z0-9.-]+(:\d{1,5})?(\/[\w./-]*)?$/;
const NUMERIC = /^[\d.]+$/;

export const isValidUpsAddress = (value: string): boolean => {
  const trimmed = value.trim();
  if (NUMERIC.test(trimmed)) return ipv4Regex.test(trimmed);
  return ipOrHostnameRegex.test(trimmed) || URL_PATTERN.test(trimmed);
};
