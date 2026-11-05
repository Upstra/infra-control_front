import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useMotion, resetMotionForTests } from '../useMotion';

const mockReducedMotion = (matches: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn() }),
  );
};

describe('useMotion', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('is disabled by prefers-reduced-motion even when the setting is on', () => {
    mockReducedMotion(true);
    resetMotionForTests();
    const { enabled, animations } = useMotion();
    expect(animations.value).toBe(true);
    expect(enabled.value).toBe(false);
    expect(document.documentElement.classList.contains('no-motion')).toBe(true);
  });

  it('sets the no-motion class when the user turns animations off', async () => {
    mockReducedMotion(false);
    resetMotionForTests();
    const { enabled, setAnimations } = useMotion();
    expect(enabled.value).toBe(true);
    setAnimations(false);
    await nextTick();
    expect(document.documentElement.classList.contains('no-motion')).toBe(true);
    expect(localStorage.getItem('pulse:animations')).toBe('false');
  });
});
