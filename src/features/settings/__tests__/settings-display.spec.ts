import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import DisplaySettings from '../components/DisplaySettings.vue';
import { useUserPreferencesStore } from '../store';
import { resetMotionForTests } from '@/composables/useMotion';
import { createTestI18n } from '@/test-utils/i18n';

vi.mock('../api', () => ({
  preferencesApi: {
    getPreferences: vi.fn(),
    updatePreferences: vi.fn().mockResolvedValue({}),
  },
}));

const mountSettings = () =>
  mount(DisplaySettings, { global: { plugins: [createTestI18n()] } });

describe('display settings', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() }),
    );
    resetMotionForTests();
    setActivePinia(createPinia());
  });

  it('sets the no-motion class when animations are switched off', async () => {
    const wrapper = mountSettings();
    await wrapper.find('[data-setting="animations"]').trigger('click');
    await nextTick();
    expect(document.documentElement.classList.contains('no-motion')).toBe(true);
    expect(localStorage.getItem('pulse:animations')).toBe('false');
  });

  it('sends the theme to the backend preferences', async () => {
    const preferences = useUserPreferencesStore();
    const spy = vi
      .spyOn(preferences, 'updateSinglePreference')
      .mockResolvedValue(undefined as never);
    const wrapper = mountSettings();
    await wrapper
      .findAll('[aria-pressed]')
      .find((button) => button.text() === 'Clair')!
      .trigger('click');
    expect(spy).toHaveBeenCalledWith('theme', 'light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
