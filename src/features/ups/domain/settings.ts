import { isValidUpsAddress } from './address';
import type { UpsResponseDto, UpsUpdateDto } from '../types';

export interface UpsSettingsForm {
  name: string;
  ip: string;
  roomId: string;
  gracePeriodOn: number;
  gracePeriodOff: number;
  nominalPowerW: number | null;
  moveServers: boolean;
}

export type SettingsError = 'name_required' | 'ip_invalid' | 'nominal_invalid';

export const formFor = (ups: UpsResponseDto): UpsSettingsForm => ({
  name: ups.name,
  ip: ups.ip,
  roomId: ups.roomId,
  gracePeriodOn: ups.grace_period_on,
  gracePeriodOff: ups.grace_period_off,
  nominalPowerW: ups.nominalPowerW ?? null,
  moveServers: true,
});

export const validateSettings = (
  form: UpsSettingsForm,
): SettingsError | null => {
  if (!form.name.trim()) return 'name_required';
  if (!isValidUpsAddress(form.ip)) return 'ip_invalid';
  const nominal = form.nominalPowerW;
  if (
    nominal !== null &&
    (!Number.isInteger(nominal) || nominal < 1 || nominal > 1_000_000)
  ) {
    return 'nominal_invalid';
  }
  return null;
};

export const roomChanged = (form: UpsSettingsForm, ups: UpsResponseDto) =>
  form.roomId !== ups.roomId;

export const toUpdatePayload = (
  form: UpsSettingsForm,
  ups: UpsResponseDto,
  serverCount: number,
): UpsUpdateDto => {
  const payload: UpsUpdateDto = {
    name: form.name.trim(),
    ip: form.ip.trim(),
    roomId: form.roomId,
    grace_period_on: form.gracePeriodOn,
    grace_period_off: form.gracePeriodOff,
    nominalPowerW: form.nominalPowerW,
  };
  if (roomChanged(form, ups) && serverCount > 0) {
    payload.moveServers = form.moveServers;
  }
  return payload;
};
