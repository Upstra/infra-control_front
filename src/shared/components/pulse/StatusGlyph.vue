<script setup lang="ts">
import type { HealthState } from './types';

withDefaults(defineProps<{ state: HealthState; size?: number }>(), {
  size: 10,
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 10 10"
    aria-hidden="true"
    class="flex-none"
    :data-state="state"
  >
    <circle
      v-if="state === 'up'"
      cx="5"
      cy="5"
      r="4.5"
      fill="rgb(var(--c-success))"
    />
    <path
      v-else-if="state === 'degraded'"
      d="M5 .5 9.5 9.5H.5z"
      fill="rgb(var(--c-warning))"
    />
    <rect
      v-else-if="state === 'down'"
      x=".5"
      y=".5"
      width="9"
      height="9"
      rx="1.5"
      fill="rgb(var(--c-danger))"
    />
    <circle
      v-else
      cx="5"
      cy="5"
      r="4"
      fill="none"
      stroke="rgb(var(--c-status-unknown))"
      stroke-width="1.4"
      stroke-dasharray="2 1.6"
    />
  </svg>
</template>
