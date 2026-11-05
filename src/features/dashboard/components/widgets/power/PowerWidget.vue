<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { AnimatedNumber, Sparkline } from '@/shared/components/pulse';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import { useMetricSeries } from '@/features/metrics/composables/useMetricSeries';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import { fmt } from '@/shared/utils/fmt';

const { t } = useI18n();
const upsLive = useUpsLiveStore();
const { data, state, refresh } = useMetricSeries({
  metric: 'total_power',
  scope: 'total',
  range: '1h',
});

onMounted(() => upsLive.start());

const points = computed(() => data.value?.series[0]?.points ?? []);

const livePower = computed(() => {
  const values = Object.values(upsLive.statusById)
    .map((status) => status.telemetry?.load.realPowerW)
    .filter((value): value is number => typeof value === 'number');
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
});

const current = computed(
  () => livePower.value ?? points.value[points.value.length - 1]?.[1] ?? null,
);

const statusState = computed(() => {
  if (state.value === 'loading' || state.value === 'idle') return 'loading';
  if (state.value === 'error') return 'error';
  return 'ready';
});
</script>

<template>
  <WidgetCard :label="t('widgets.types.power.label')">
    <div class="flex items-start gap-3">
      <div class="flex flex-col gap-0.5">
        <h2 class="m-0 text-card-title text-text-strong">
          {{ t('widgets.power.title') }}
        </h2>
        <span class="font-mono text-overline text-text-muted">{{
          t('widgets.power.subtitle', { count: upsLive.units.length })
        }}</span>
      </div>
      <div class="flex-1" />
      <span class="whitespace-nowrap font-mono text-metric text-text-strong">
        <AnimatedNumber :value="current" :format="(v) => fmt.number(v)" />
        <span class="text-card-title text-text-muted"> W</span>
      </span>
    </div>
    <div
      v-if="state === 'unavailable'"
      class="grid h-[140px] place-items-center rounded-md border border-dashed border-border-strong text-text-muted"
      data-part="unavailable"
    >
      {{ t('pulse.chart.unavailable') }}
    </div>
    <WidgetStatus v-else :state="statusState" :lines="2" @retry="refresh">
      <Sparkline
        :points="points"
        :height="140"
        :label="t('widgets.power.aria', { value: fmt.value(current, 'W') })"
        grid
      />
    </WidgetStatus>
  </WidgetCard>
</template>
