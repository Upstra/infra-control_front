<script setup lang="ts">
import { computed } from 'vue';
import { sparkGeometry } from './sparkline';
import { toneColor } from './tone';
import type { SeriesPoint, Tone } from './types';

const WIDTH = 600;

const props = withDefaults(
  defineProps<{
    points: SeriesPoint[];
    min?: number;
    max?: number;
    threshold?: number | null;
    tone?: Tone;
    height?: number;
    label: string;
    grid?: boolean;
  }>(),
  {
    min: undefined,
    max: undefined,
    threshold: null,
    tone: 'primary',
    height: 48,
    grid: false,
  },
);

const geometry = computed(() =>
  sparkGeometry(props.points, {
    width: WIDTH,
    height: props.height,
    min: props.min,
    max: props.max,
    threshold: props.threshold,
  }),
);
const stroke = computed(() => toneColor[props.tone]);
const gradientId = `spark-${Math.random().toString(36).slice(2, 9)}`;
</script>

<template>
  <svg
    :viewBox="`0 0 ${WIDTH} ${height}`"
    preserveAspectRatio="none"
    role="img"
    :aria-label="label"
    class="block w-full"
    :style="{ height: `${height}px` }"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="stroke" stop-opacity=".22" />
        <stop offset="1" :stop-color="stroke" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path
      v-if="grid"
      :d="`M0 1H${WIDTH}M0 ${height / 2}H${WIDTH}M0 ${height - 1}H${WIDTH}`"
      stroke="rgb(var(--c-surface-raised))"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
    />
    <template v-if="geometry">
      <path
        v-if="geometry.threshold"
        :d="geometry.threshold"
        stroke="rgb(var(--c-warning))"
        stroke-width="1"
        stroke-dasharray="4 4"
        vector-effect="non-scaling-stroke"
        data-part="threshold"
      />
      <path :d="geometry.area" :fill="`url(#${gradientId})`" />
      <path
        :d="geometry.line"
        fill="none"
        :stroke="stroke"
        stroke-width="2"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
        data-part="line"
      />
    </template>
  </svg>
</template>
