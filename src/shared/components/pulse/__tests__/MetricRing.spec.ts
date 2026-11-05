import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricRing from '../MetricRing.vue';
import { createTestI18n } from '@/test-utils/i18n';
import { useMotion, resetMotionForTests } from '@/composables/useMotion';

const mountRing = (value: number | null) =>
  mount(MetricRing, {
    props: { value, size: 176, caption: '% batterie' },
    global: { plugins: [createTestI18n()] },
  });

describe('MetricRing', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMotionForTests();
  });

  it('draws the arc in danger under 40 %', () => {
    const wrapper = mountRing(38);
    expect(wrapper.attributes('data-tone')).toBe('danger');
    expect(wrapper.find('[data-part="arc"]').attributes('stroke')).toContain(
      '--c-danger',
    );
  });

  it('shows a dashed track and an em dash when the value is null', () => {
    const wrapper = mountRing(null);
    expect(wrapper.find('[data-part="arc"]').exists()).toBe(false);
    expect(
      wrapper.find('[data-part="track"]').attributes('stroke-dasharray'),
    ).toBeTruthy();
    expect(wrapper.find('[data-part="value"]').text()).toBe('—');
  });

  it('changes the value in place without transition when motion is off', async () => {
    useMotion().setAnimations(false);
    const wrapper = mountRing(80);
    await wrapper.setProps({ value: 30 });
    expect(wrapper.find('[data-part="value"]').text()).toBe('30');
    expect(wrapper.find('[data-part="arc"]').attributes('style')).toContain(
      'transition: none',
    );
  });
});
