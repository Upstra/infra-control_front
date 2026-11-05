<script setup lang="ts">
import { exceeds } from '@/shared/utils/thresholds';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SummaryStrip, type SummaryCell } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { DEFAULT_INLET_WARN_C } from '../../domain/health';
import type { ServersSummary } from '../../domain/row';

const props = defineProps<{ summary: ServersSummary }>();
const { t } = useI18n();

const cells = computed<SummaryCell[]>(() => {
  const s = props.summary;
  return [
    {
      key: 'total',
      label: t('serversPage.summary.total'),
      accent: 'bg-primary-text',
      value: String(s.total),
      suffix: t('serversPage.summary.total_suffix', {
        esxi: s.esxi,
        vcenter: s.vcenter,
      }),
    },
    {
      key: 'on',
      label: t('serversPage.summary.on'),
      accent: 'bg-success',
      value: String(s.on),
      suffix: t('serversPage.summary.on_suffix'),
    },
    {
      key: 'watch',
      label: t('serversPage.summary.watch'),
      accent: 'bg-warning',
      value: String(s.watch),
      suffix: t('serversPage.summary.watch_suffix'),
      tone: s.watch ? 'text-warning-text' : '',
    },
    {
      key: 'down',
      label: t('serversPage.summary.down'),
      accent: 'bg-danger',
      value: String(s.down),
      suffix: s.down
        ? t('serversPage.summary.down_some')
        : t('serversPage.summary.none'),
      tone: s.down ? 'text-danger-text bg-[rgb(var(--c-danger)/0.06)]' : '',
    },
    {
      key: 'power',
      label: t('serversPage.summary.power'),
      accent: 'bg-primary-hover',
      value: fmt.number(s.powerW),
      suffix: t('serversPage.summary.power_suffix', {
        count: s.withoutReading,
      }),
    },
    {
      key: 'inlet',
      label: t('serversPage.summary.inlet'),
      accent: 'bg-warning',
      value: fmt.number(s.hottest?.inletC),
      suffix: s.hottest
        ? t('serversPage.summary.inlet_suffix', { name: s.hottest.name })
        : null,
      tone: exceeds(s.hottest?.inletC, DEFAULT_INLET_WARN_C)
        ? 'text-warning-text'
        : '',
    },
  ];
});
</script>

<template>
  <SummaryStrip :cells="cells" :label="t('serversPage.summary.region')" />
</template>
