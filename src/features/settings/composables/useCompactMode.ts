import { computed } from 'vue';
import { useUserPreferencesStore } from '../store';

export function useCompactMode() {
  const preferencesStore = useUserPreferencesStore();

  const isCompactMode = computed(() => preferencesStore.display.compactMode);

  const spacingClasses = computed(() => ({
    padding: isCompactMode.value ? 'p-3' : 'p-6',
    paddingX: isCompactMode.value ? 'px-3' : 'px-6',
    paddingY: isCompactMode.value ? 'py-2' : 'py-4',
    gap: isCompactMode.value ? 'gap-2' : 'gap-4',
    space: isCompactMode.value ? 'space-y-2' : 'space-y-4',
    margin: isCompactMode.value ? 'mb-2' : 'mb-4',
    marginY: isCompactMode.value ? 'my-2' : 'my-4',
    rounded: isCompactMode.value ? 'rounded-lg' : 'rounded-xl',
  }));

  const sizeClasses = computed(() => ({
    text: {
      title: isCompactMode.value ? 'text-xl' : 'text-2xl',
      subtitle: isCompactMode.value ? 'text-sm' : 'text-base',
      body: isCompactMode.value ? 'text-xs' : 'text-sm',
    },
    icon: {
      large: isCompactMode.value ? 'h-5 w-5' : 'h-6 w-6',
      medium: isCompactMode.value ? 'h-4 w-4' : 'h-5 w-5',
      small: isCompactMode.value ? 'h-3 w-3' : 'h-4 w-4',
    },
  }));

  return {
    isCompactMode,
    spacingClasses,
    sizeClasses,
  };
}
