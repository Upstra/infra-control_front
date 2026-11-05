<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { StatusGlyph } from '@/shared/components/pulse';
import { ringTone, toneColor } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { shortLabel, type UpsRowModel } from '../../domain/row';

const props = defineProps<{
  row: UpsRowModel;
  roomName: string | null;
  selected: boolean;
}>();
const emit = defineEmits<{ select: [] }>();

const { t } = useI18n();
const CIRCUMFERENCE = 2 * Math.PI * 50;

const label = computed(() => {
  const { key, params } = shortLabel(
    props.row,
    fmt.minutes(props.row.minutesRemaining).toUpperCase(),
    fmt.percent(props.row.loadPercent),
  );
  return t(key, params ?? {});
});

const stateText: Record<string, string> = {
  up: 'text-success-text',
  degraded: 'text-warning-text',
  down: 'text-danger-text',
  unknown: 'text-status-unknown',
};

const runtimeClass = computed(() => {
  if (props.row.condition === 'on_battery') return 'text-danger-text';
  if ((props.row.minutesRemaining ?? Infinity) < 15) return 'text-warning-text';
  return 'text-text-strong';
});

const offset = computed(() =>
  props.row.battery === null
    ? CIRCUMFERENCE
    : CIRCUMFERENCE * (1 - props.row.battery / 100),
);
</script>

<template>
  <button
    type="button"
    :aria-current="selected ? 'true' : undefined"
    :class="[
      'flex w-full items-center gap-3.5 border-b border-surface-raised px-4 py-3.5 text-left transition-colors duration-[120ms] hover:bg-surface-raised',
      selected &&
        'bg-surface-raised shadow-[inset_3px_0_0_0_rgb(var(--c-primary-hover))]',
    ]"
    :data-condition="row.condition"
    @click="emit('select')"
  >
    <span class="relative grid h-11 w-11 flex-none place-items-center">
      <svg
        viewBox="0 0 120 120"
        class="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="rgb(var(--c-border))"
          stroke-width="12"
          :stroke-dasharray="row.battery === null ? '6 6' : undefined"
        />
        <circle
          v-if="row.battery !== null"
          cx="60"
          cy="60"
          r="50"
          fill="none"
          :stroke="toneColor[ringTone(row.battery)]"
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="offset"
        />
      </svg>
      <span class="font-mono text-[11px] text-text-strong tnum">{{
        fmt.number(row.battery)
      }}</span>
    </span>
    <span class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="flex items-center gap-2">
        <span class="truncate font-medium text-text-strong">{{
          row.name
        }}</span>
        <span class="text-caption text-text-muted">{{ roomName ?? '' }}</span>
      </span>
      <span
        :class="[
          'inline-flex items-center gap-1.5 font-mono text-overline tracking-[0.04em]',
          stateText[row.health],
        ]"
      >
        <StatusGlyph :state="row.health" :size="9" /><span class="truncate">{{
          label
        }}</span>
      </span>
    </span>
    <span class="flex flex-none flex-col items-end gap-1 font-mono tnum">
      <span :class="['whitespace-nowrap', runtimeClass]">{{
        fmt.minutes(row.minutesRemaining)
      }}</span>
      <span class="whitespace-nowrap text-overline text-text-muted">{{
        t('upsPage.list.load', { percent: fmt.percent(row.loadPercent) })
      }}</span>
    </span>
  </button>
</template>
