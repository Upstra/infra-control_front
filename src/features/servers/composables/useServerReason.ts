import { useI18n } from 'vue-i18n';
import { fmt } from '@/shared/utils/fmt';
import type { ServerReason } from '../domain/health';
import type { ServerRowModel } from '../domain/row';

export const useServerReason = () => {
  const { t } = useI18n();

  const reasonText = (reason: ServerReason): string => {
    switch (reason.kind) {
      case 'on_battery':
        return t('serversPage.reason.on_battery', { ups: reason.ups });
      case 'psu_missing':
        return t(
          'serversPage.reason.psu_missing',
          { missing: reason.missing },
          reason.missing,
        );
      case 'inlet':
        return t('serversPage.reason.inlet', {
          value: fmt.value(reason.value, '°C'),
        });
      case 'hardware':
        return t('serversPage.reason.hardware', { health: reason.health });
      case 'cpu':
        return t('serversPage.reason.cpu', {
          value: fmt.percent(reason.value),
        });
      default:
        return t(`serversPage.reason.${reason.kind}`);
    }
  };

  const lineOf = (row: ServerRowModel) =>
    row.health.state === 'up'
      ? t('serversPage.reason.nominal', {
          room: row.roomName ?? t('pulse.empty'),
          ups: row.upsName ?? t('serversPage.reason.no_ups'),
        })
      : row.health.reasons.map(reasonText).join(' · ');

  const pillKey = (row: ServerRowModel) => {
    const state = row.health.state;
    if (state === 'degraded' && row.health.reasons[0]?.kind === 'on_battery')
      return 'on_battery';
    if (state === 'down' && row.health.reasons[0]?.kind === 'disconnected')
      return 'disconnected';
    return state;
  };

  return { reasonText, lineOf, pillKey };
};
