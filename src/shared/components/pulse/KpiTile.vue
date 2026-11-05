<script setup lang="ts">
import { computed, type Component } from 'vue';
import StatusGlyph from './StatusGlyph.vue';
import type { HealthState } from './types';

const props = defineProps<{
  icon: Component;
  label: string;
  value: string;
  suffix?: string | null;
  state?: 'ok' | 'warning';
  note?: string | null;
  noteState?: HealthState;
  progress?: number | null;
}>();

const warning = computed(() => props.state === 'warning');
const noteTone = computed<HealthState>(
  () => props.noteState ?? (warning.value ? 'degraded' : 'up'),
);
const noteClass: Record<HealthState, string> = {
  up: 'text-success-text',
  degraded: 'text-warning-text',
  down: 'text-danger-text',
  unknown: 'text-status-unknown',
};
const progressWidth = computed(() =>
  props.progress === null || props.progress === undefined
    ? null
    : `${Math.min(100, Math.max(0, props.progress))}%`,
);
</script>

<template>
  <div
    :class="[
      'flex flex-col gap-6 rounded-lg border p-6 shadow-sm transition-colors duration-[120ms]',
      warning
        ? 'border-warning kpi-warning'
        : 'border-border bg-surface hover:border-border-strong',
    ]"
    :data-state="state ?? 'ok'"
  >
    <div
      class="flex items-center gap-2 font-mono text-overline uppercase text-text-muted"
    >
      <component
        :is="icon"
        :class="['h-4 w-4', warning ? 'text-warning' : 'text-primary-text']"
        aria-hidden="true"
      />
      {{ label }}
    </div>
    <div class="flex items-baseline gap-2 whitespace-nowrap">
      <span
        :class="[
          'font-mono text-metric tnum',
          warning ? 'text-warning-text' : 'text-text-strong',
        ]"
        data-part="value"
        >{{ value }}</span
      >
      <span v-if="suffix" class="text-card-title text-text-muted">{{
        suffix
      }}</span>
    </div>
    <div
      v-if="progressWidth !== null"
      class="h-1.5 overflow-hidden rounded-full bg-border"
    >
      <i
        class="block h-full rounded-full bg-primary-hover shadow-[0_0_10px_0_rgb(var(--c-primary-hover))] transition-[width] duration-700 ease-pulse"
        :style="{ width: progressWidth }"
      />
    </div>
    <div
      v-else-if="note"
      :class="['flex items-center gap-2 text-caption', noteClass[noteTone]]"
    >
      <StatusGlyph :state="noteTone" />{{ note }}
    </div>
  </div>
</template>

<style scoped>
.kpi-warning {
  background: radial-gradient(
    ellipse at top right,
    var(--c-warning-surface),
    rgb(var(--c-surface)) 60%
  );
}
</style>
