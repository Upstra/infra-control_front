import { computed, type Ref } from 'vue';
import { useNow } from '@vueuse/core';
import { useUpsLiveStore } from '../liveStore';
import { useAlertsStore } from '@/features/alerts/store';
import { outageStartOf, shutdownCountdown } from '../domain/countdown';
import type { UpsResponseDto } from '../types';

export const useUpsCountdown = (ups: Ref<UpsResponseDto | null>) => {
  const live = useUpsLiveStore();
  const alerts = useAlertsStore();
  const now = useNow({ interval: 1000 });

  const start = computed(() => {
    const id = ups.value?.id;
    if (!id || live.statusById[id]?.onBattery !== true) return null;
    return outageStartOf({
      onBatterySince: live.statusById[id]?.onBatterySince,
      statusChangedAt: live.outageStartById[id],
      alertOpenedAt: alerts.open.find(
        (alert) => alert.type === 'ups_on_battery' && alert.resourceId === id,
      )?.openedAt,
    });
  });

  const countdown = computed(() =>
    ups.value
      ? shutdownCountdown(
          start.value,
          ups.value.grace_period_off,
          now.value.getTime(),
        )
      : null,
  );

  return { start, countdown, now };
};
