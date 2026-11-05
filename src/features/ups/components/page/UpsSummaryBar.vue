<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { fmt } from '@/shared/utils/fmt';
import type { FleetSummary } from '../../domain/summary';

const props = defineProps<{ summary: FleetSummary }>();

const { t } = useI18n();

const cells = computed(() => {
  const s = props.summary;
  return [
    {
      key: 'total',
      accent: 'bg-primary-text',
      value: String(s.total),
      suffix: t('upsPage.summary.total_suffix'),
      tone: '',
    },
    {
      key: 'on_battery',
      accent: 'bg-danger',
      value: String(s.onBattery),
      suffix: s.onBattery
        ? t('upsPage.summary.on_battery_some')
        : t('upsPage.summary.none'),
      tone: s.onBattery
        ? 'text-danger-text bg-[rgb(var(--c-danger)/0.06)]'
        : '',
    },
    {
      key: 'watch',
      accent: 'bg-warning',
      value: String(s.watch),
      suffix: t('upsPage.summary.watch_suffix'),
      tone: s.watch ? 'text-warning-text' : '',
    },
    {
      key: 'unreachable',
      accent: 'bg-status-unknown',
      value: String(s.unreachable),
      suffix: s.unreachable
        ? t('upsPage.summary.unreachable_some')
        : t('upsPage.summary.none'),
      tone: s.unreachable ? 'text-text' : '',
    },
    {
      key: 'min_runtime',
      accent: 'bg-primary-text',
      value: fmt.number(s.minRuntime),
      suffix: t('upsPage.summary.min_suffix'),
      tone: s.onBattery ? 'text-danger-text' : '',
    },
    {
      key: 'power',
      accent: 'bg-primary-hover',
      value: fmt.number(s.powerW),
      suffix: s.capacityPartial
        ? t('upsPage.summary.power_partial')
        : t('upsPage.summary.power_capacity', {
            capacity: fmt.number(s.capacityW),
          }),
      tone: '',
    },
  ];
});
</script>

<template>
  <section
    :aria-label="t('upsPage.summary.region')"
    class="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] overflow-hidden rounded-lg border border-border bg-surface shadow-sm tnum"
  >
    <div
      v-for="cell in cells"
      :key="cell.key"
      :class="[
        'flex flex-col gap-1.5 border-r border-surface-raised px-[22px] py-[18px]',
        cell.tone,
      ]"
      :data-summary="cell.key"
    >
      <span
        class="flex items-center gap-2 font-mono text-overline text-text-muted"
      >
        <span :class="['h-2 w-2 rounded-[2px]', cell.accent]" />{{
          t(`upsPage.summary.${cell.key}`)
        }}
      </span>
      <span class="flex flex-wrap items-baseline gap-x-1.5">
        <span
          :class="[
            'font-mono text-[28px] font-light leading-8 tracking-[-0.02em]',
            cell.tone ? '' : 'text-text-strong',
          ]"
          data-part="value"
          >{{ cell.value }}</span
        >
        <span class="text-[13px] text-text-muted">{{ cell.suffix }}</span>
      </span>
    </div>
  </section>
</template>
