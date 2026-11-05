import { computed, ref, watch } from 'vue';

const STORAGE_KEY = 'pulse:animations';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const NO_MOTION_CLASS = 'no-motion';

const readStored = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
};

const queryReduced = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_QUERY)
    : null;

const animations = ref(readStored());
const reducedMotion = ref(queryReduced()?.matches ?? false);
const enabled = computed(() => animations.value && !reducedMotion.value);

let initialized = false;

const init = () => {
  if (initialized) return;
  initialized = true;
  queryReduced()?.addEventListener?.('change', (event) => {
    reducedMotion.value = event.matches;
  });
  watch(
    enabled,
    (value) => {
      document.documentElement.classList.toggle(NO_MOTION_CLASS, !value);
    },
    { immediate: true },
  );
};

const setAnimations = (value: boolean) => {
  animations.value = value;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    return;
  }
};

export const useMotion = () => {
  init();
  return { enabled, animations, reducedMotion, setAnimations };
};

export const resetMotionForTests = () => {
  initialized = false;
  animations.value = readStored();
  reducedMotion.value = queryReduced()?.matches ?? false;
};
