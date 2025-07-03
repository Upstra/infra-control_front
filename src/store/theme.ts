import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light');

  const loadTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      theme.value = stored;
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      theme.value = prefersDark ? 'dark' : 'light';
    }
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (themeValue: Theme) => {
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  loadTheme();
  applyTheme(theme.value);

  return {
    theme,
    setTheme,
  };
});
