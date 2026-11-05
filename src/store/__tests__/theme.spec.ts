import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';
import { useThemeStore } from '../theme';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    setActivePinia(createPinia());
  });

  it('starts in dark when nothing is stored', () => {
    const store = useThemeStore();
    expect(store.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('keeps the stored theme over the backend preference', () => {
    localStorage.setItem('theme', 'light');
    const store = useThemeStore();
    store.applyPreference('dark');
    expect(store.theme).toBe('light');
  });

  it('applies the backend preference when nothing is stored', async () => {
    const store = useThemeStore();
    store.applyPreference('light');
    await nextTick();
    expect(store.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
