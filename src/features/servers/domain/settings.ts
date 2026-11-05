import { ipOrHostnameRegex, ipv4Regex } from '@/utils/regex';
import type { Server } from '../types';

export interface ServerSettingsForm {
  name: string;
  ip: string;
  priority: number;
  roomId: string;
  upsId: string | null;
}

export type ServerSettingsError =
  | 'name_required'
  | 'ip_invalid'
  | 'priority_invalid'
  | 'room_required';

export const isValidHost = (value: string) => {
  const trimmed = value.trim();
  return /^[\d.]+$/.test(trimmed)
    ? ipv4Regex.test(trimmed)
    : ipOrHostnameRegex.test(trimmed);
};

export const serverFormFor = (server: Server): ServerSettingsForm => ({
  name: server.name,
  ip: server.ip,
  priority: server.priority,
  roomId: server.roomId,
  upsId: server.upsId ?? null,
});

export const validateServerSettings = (
  form: ServerSettingsForm,
): ServerSettingsError | null => {
  if (!form.name.trim()) return 'name_required';
  if (!isValidHost(form.ip)) return 'ip_invalid';
  if (!Number.isInteger(form.priority) || form.priority < 1)
    return 'priority_invalid';
  if (!form.roomId) return 'room_required';
  return null;
};

export const isDuplicate = (
  candidate: { name: string; ip: string; id?: string },
  servers: Pick<Server, 'id' | 'name' | 'ip'>[],
) => {
  const name = candidate.name.trim().toLowerCase();
  const ip = candidate.ip.trim().toLowerCase();
  return servers.some(
    (server) =>
      server.id !== candidate.id &&
      (server.name.toLowerCase() === name || server.ip.toLowerCase() === ip),
  );
};
