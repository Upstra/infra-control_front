<script setup lang="ts">
import { computed } from 'vue';
import StatusGlyph from './StatusGlyph.vue';
import type { HealthState } from './types';

const props = defineProps<{
  state: HealthState;
  label: string;
  detail?: string | null;
  bare?: boolean;
}>();

const pillClass: Record<HealthState, string> = {
  up: 'bg-success-surface text-success-text',
  degraded: 'bg-warning-surface text-warning-text',
  down: 'bg-danger-surface text-danger-text',
  unknown: 'border border-dashed border-border-strong text-status-unknown',
};

const bareClass: Record<HealthState, string> = {
  up: 'text-success-text',
  degraded: 'text-warning-text',
  down: 'text-danger-text',
  unknown: 'text-status-unknown',
};

const text = computed(() =>
  props.detail ? `${props.label} · ${props.detail}` : props.label,
);
</script>

<template>
  <span
    v-if="bare"
    :class="[
      'inline-flex items-center gap-2 text-caption font-medium',
      bareClass[state],
    ]"
  >
    <StatusGlyph :state="state" />{{ text }}
  </span>
  <span
    v-else
    :class="[
      'inline-flex h-7 max-w-full items-center gap-2 rounded-full px-3 font-mono text-overline uppercase tnum whitespace-nowrap',
      pillClass[state],
    ]"
    :title="text"
  >
    <StatusGlyph :state="state" /><span class="truncate">{{ text }}</span>
  </span>
</template>
