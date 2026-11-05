<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkline } from '@/shared/components/pulse';
import { useMetricSeries } from '@/features/metrics/composables/useMetricSeries';
import { CPU_WARN } from '../../../domain/health';

const props = defineProps<{ moid: string; name: string }>();

const { t } = useI18n();
const { data, state } = useMetricSeries(() => ({
  metric: 'host_cpu',
  scope: 'host',
  id: props.moid,
  range: '1h',
}));
const points = computed(() => data.value?.series[0]?.points ?? []);
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <span class="font-mono text-overline text-text-muted">{{
      t('serversPage.metrics.cpu_history')
    }}</span>
    <div
      v-if="
        state === 'unavailable' ||
        state === 'error' ||
        (state === 'ready' && points.length < 2)
      "
      class="grid h-[110px] place-items-center rounded-[12px] border border-dashed border-border-strong text-text-muted"
    >
      {{ t('pulse.chart.unavailable') }}
    </div>
    <Sparkline
      v-else
      :points="points"
      :min="0"
      :max="100"
      :threshold="CPU_WARN"
      :height="110"
      :label="t('serversPage.metrics.cpu_aria', { name })"
      grid
    />
  </div>
</template>
