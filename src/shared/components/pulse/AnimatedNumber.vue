<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useMotion } from '@/composables/useMotion';
import { EMPTY } from '@/shared/utils/fmt';

const DURATION_MS = 600;

const props = withDefaults(
  defineProps<{
    value: number | null | undefined;
    format?: (v: number) => string;
  }>(),
  { format: (v: number) => String(Math.round(v)) },
);

const { enabled } = useMotion();
const shown = ref<number | null>(props.value ?? null);
let frame: number | null = null;

const stop = () => {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
};

const tween = (from: number, to: number) => {
  const start = performance.now();
  const step = (now: number) => {
    const k = Math.min((now - start) / DURATION_MS, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    shown.value = from + (to - from) * eased;
    frame = k < 1 ? requestAnimationFrame(step) : null;
  };
  frame = requestAnimationFrame(step);
};

watch(
  () => props.value,
  (next) => {
    stop();
    const from = shown.value;
    if (
      next === null ||
      next === undefined ||
      from === null ||
      !enabled.value
    ) {
      shown.value = next ?? null;
      return;
    }
    tween(from, next);
  },
);

onBeforeUnmount(stop);
</script>

<template>
  <span class="tnum">{{ shown === null ? EMPTY : format(shown) }}</span>
</template>
