import { describe, it, expect, vi, afterEach } from 'vitest';
import { effectScope } from 'vue';
import { useArmedAction } from '../composables/useArmedAction';

const setup = () => effectScope().run(() => useArmedAction())!;

describe('armed VM stop', () => {
  afterEach(() => vi.useRealTimers());

  it('arms on the first click and runs on the second within 3 s', () => {
    vi.useFakeTimers();
    const { trigger, armed } = setup();
    const run = vi.fn();
    expect(trigger('vm-1', run)).toBe(false);
    expect(armed.value).toBe('vm-1');
    vi.advanceTimersByTime(2000);
    expect(trigger('vm-1', run)).toBe(true);
    expect(run).toHaveBeenCalledOnce();
  });

  it('disarms after 3 s', () => {
    vi.useFakeTimers();
    const { trigger, armed } = setup();
    const run = vi.fn();
    trigger('vm-1', run);
    vi.advanceTimersByTime(3001);
    expect(armed.value).toBeNull();
    trigger('vm-1', run);
    expect(run).not.toHaveBeenCalled();
  });
});
