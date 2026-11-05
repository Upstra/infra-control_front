import { watch } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import { useAlertsStore } from '@/features/alerts/store';
import { useUpsLiveStore } from '@/features/ups/liveStore';

export const useLiveInfrastructure = () => {
  const auth = useAuthStore();
  const alerts = useAlertsStore();
  const upsLive = useUpsLiveStore();

  watch(
    () => auth.token,
    (token) => {
      if (!token) return;
      alerts.start();
      upsLive.start();
    },
    { immediate: true },
  );

  return { alerts, upsLive };
};
