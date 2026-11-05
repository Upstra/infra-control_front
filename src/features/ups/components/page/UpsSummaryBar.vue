<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SummaryStrip, type SummaryCell } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import type { FleetSummary } from '../../domain/summary';

const props = defineProps<{ summary: FleetSummary }>();

const { t } = useI18n();

const cells = computed<SummaryCell[]>(() => {
  const s = props.summary;
  return [
    {
      key: 'total',
      label: t('upsPage.summary.total'),
      accent: 'bg-primary-text',
      value: String(s.total),
      suffix: t('upsPage.summary.total_suffix'),
      tone: '',
    },
    {
      key: 'on_battery',
      label: t('upsPage.summary.on_battery'),
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
      label: t('upsPage.summary.watch'),
      accent: 'bg-warning',
      value: String(s.watch),
      suffix: t('upsPage.summary.watch_suffix'),
      tone: s.watch ? 'text-warning-text' : '',
    },
    {
      key: 'unreachable',
      label: t('upsPage.summary.unreachable'),
      accent: 'bg-status-unknown',
      value: String(s.unreachable),
      suffix: s.unreachable
        ? t('upsPage.summary.unreachable_some')
        : t('upsPage.summary.none'),
      tone: s.unreachable ? 'text-text' : '',
    },
    {
      key: 'min_runtime',
      label: t('upsPage.summary.min_runtime'),
      accent: 'bg-primary-text',
      value: fmt.number(s.minRuntime),
      suffix: t('upsPage.summary.min_suffix'),
      tone: s.onBattery ? 'text-danger-text' : '',
    },
    {
      key: 'power',
      label: t('upsPage.summary.power'),
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
  <SummaryStrip :cells="cells" :label="t('upsPage.summary.region')" />
</template>
