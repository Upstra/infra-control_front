<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AnimatedNumber from './AnimatedNumber.vue';
import { DEFAULT_RING_THRESHOLDS, ringTone, toneColor } from './tone';
import { useMotion } from '@/composables/useMotion';
import type { RingThresholds } from './types';

const props = withDefaults(
  defineProps<{
    value: number | null | undefined;
    size?: 64 | 176;
    caption?: string;
    thresholds?: RingThresholds;
  }>(),
  { size: 64, caption: undefined, thresholds: () => DEFAULT_RING_THRESHOLDS },
);

const { t } = useI18n();
const { enabled } = useMotion();

const large = computed(() => props.size === 176);
const radius = computed(() => (large.value ? 52 : 50));
const stroke = computed(() => (large.value ? 8 : 12));
const circumference = computed(() => 2 * Math.PI * radius.value);
const missing = computed(
  () => props.value === null || props.value === undefined,
);
const clamped = computed(() =>
  Math.min(100, Math.max(0, props.value ?? 0)),
);
const tone = computed(() => ringTone(props.value, props.thresholds));
const offset = computed(
  () => circumference.value * (1 - clamped.value / 100),
);
const ariaLabel = computed(() => {
  const caption = props.caption ?? '';
  return missing.value
    ? t('pulse.ring.aria_empty', { caption })
    : t('pulse.ring.aria', { caption, value: `${Math.round(clamped.value)} %` });
});
</script>

<template>
  <span
    role="img"
    :aria-label="ariaLabel"
    class="relative grid flex-none place-items-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :data-tone="tone"
  >
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 120 120"
      aria-hidden="true"
      class="absolute inset-0 -rotate-90"
    >
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        stroke="rgb(var(--c-border))"
        :stroke-width="stroke"
        :stroke-dasharray="missing ? '4 6' : undefined"
        data-part="track"
      />
      <circle
        v-if="!missing"
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke="toneColor[tone]"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :style="{
          transition: enabled
            ? 'stroke-dashoffset .7s var(--ease-pulse), stroke .3s'
            : 'none',
          filter:
            tone === 'danger'
              ? 'drop-shadow(0 0 6px rgb(var(--c-danger) / .6))'
              : undefined,
        }"
        data-part="arc"
      />
    </svg>
    <span
      class="flex flex-col items-center font-mono text-text-strong"
      aria-hidden="true"
    >
      <AnimatedNumber
        :value="missing ? null : clamped"
        :class="large ? 'text-metric' : 'text-code'"
        data-part="value"
      />
      <small
        v-if="large && caption"
        class="text-overline uppercase text-text-muted"
        >{{ caption }}</small
      >
    </span>
  </span>
</template>
