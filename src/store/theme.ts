import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'dark';

const isTheme = (value: unknown): value is Theme =>
  value === 'dark' || value === 'light';

const readStoredTheme = (): Theme | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : null;
};

const applyTheme = (value: Theme) => {
  document.documentElement.classList.toggle('dark', value === 'dark');
};

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(readStoredTheme() ?? DEFAULT_THEME);

  const setTheme = (value: Theme) => {
    theme.value = value;
    localStorage.setItem(STORAGE_KEY, value);
  };

  const applyPreference = (value: Theme | null | undefined) => {
    if (readStoredTheme() || !isTheme(value)) return;
    theme.value = value;
  };

  watch(theme, applyTheme, { immediate: true });

  return {
    theme,
    setTheme,
    applyPreference,
  };
});
