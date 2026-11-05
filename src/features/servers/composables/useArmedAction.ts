import { onScopeDispose, ref } from 'vue';

export const ARM_WINDOW_MS = 3000;

export const useArmedAction = (windowMs = ARM_WINDOW_MS) => {
  const armed = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    armed.value = null;
  };

  const trigger = (key: string, run: () => void) => {
    if (armed.value === key) {
      clear();
      run();
      return true;
    }
    clear();
    armed.value = key;
    timer = setTimeout(clear, windowMs);
    return false;
  };

  onScopeDispose(clear);

  return { armed, trigger, clear };
};
