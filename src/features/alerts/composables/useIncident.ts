import { computed } from 'vue';
import { useAlertsStore } from '../store';

export const useIncident = () => {
  const store = useAlertsStore();
  const incident = computed(() => store.criticalOpen[0] ?? null);
  const others = computed(() => store.criticalOpen.slice(1));
  return { incident, others };
};
