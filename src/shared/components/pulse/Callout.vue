<script setup lang="ts">
import { TriangleAlert, Info } from 'lucide-vue-next';

export type CalloutTone = 'danger' | 'warning' | 'neutral' | 'info';

withDefaults(
  defineProps<{ tone: CalloutTone; title: string; text?: string | null }>(),
  { text: null },
);

const toneClass: Record<CalloutTone, string> = {
  danger: 'callout-danger border-danger-border',
  warning: 'border-warning/40 bg-warning-surface',
  neutral: 'border-dashed border-border-strong',
  info: 'border-primary-dark bg-[rgb(var(--c-primary-hover)/0.08)]',
};
const iconClass: Record<CalloutTone, string> = {
  danger: 'text-danger',
  warning: 'text-warning',
  neutral: 'text-status-unknown',
  info: 'text-primary-text',
};
</script>

<template>
  <div
    role="status"
    :class="[
      'flex items-start gap-3.5 rounded-[14px] border px-[18px] py-4',
      toneClass[tone],
    ]"
    :data-tone="tone"
  >
    <TriangleAlert
      v-if="tone === 'danger' || tone === 'warning'"
      :class="['mt-px h-[18px] w-[18px] flex-none', iconClass[tone]]"
      aria-hidden="true"
    />
    <Info
      v-else
      :class="['mt-px h-[18px] w-[18px] flex-none', iconClass[tone]]"
      aria-hidden="true"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="font-medium text-text-strong">{{ title }}</span>
      <span v-if="text" class="text-text">{{ text }}</span>
    </div>
    <slot name="aside" />
  </div>
</template>

<style scoped>
.callout-danger {
  background: radial-gradient(
    ellipse at left,
    rgb(var(--c-danger) / 0.14),
    rgb(var(--c-surface)) 60%
  );
}
</style>
