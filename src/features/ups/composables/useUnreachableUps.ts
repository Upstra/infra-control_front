import { computed } from 'vue';
import { useAlertsStore } from '@/features/alerts/store';

export const useUnreachableUps = () => {
  const alerts = useAlertsStore();
  return computed(
    () =>
      new Set(
        alerts.open
          .filter((alert) => alert.type === 'ups_unreachable')
          .map((alert) => alert.resourceId),
      ),
  );
};
