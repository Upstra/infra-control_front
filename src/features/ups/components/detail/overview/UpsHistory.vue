<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  SegmentedControl,
  Sparkline,
  type Tone,
} from '@/shared/components/pulse';
import { useMetricSeries } from '@/features/metrics/composables/useMetricSeries';
import type { MetricName, MetricRange } from '@/features/metrics/types';

type Measure = 'battery' | 'load' | 'input';

interface MeasureSpec {
  metric: MetricName;
  unit: string;
  min: number;
  max: number;
  threshold: number | null;
  tone: Tone;
}

const MEASURES: Record<Measure, MeasureSpec> = {
  battery: {
    metric: 'ups_battery_charge',
    unit: '%',
    min: 0,
    max: 100,
    threshold: 40,
    tone: 'success',
  },
  load: {
    metric: 'ups_load',
    unit: '%',
    min: 0,
    max: 100,
    threshold: 80,
    tone: 'primary',
  },
  input: {
    metric: 'ups_input_voltage',
    unit: 'V',
    min: 0,
    max: 260,
    threshold: null,
    tone: 'primary',
  },
};

const props = defineProps<{ upsId: string; upsName: string }>();

const { t } = useI18n();
const measure = ref<Measure>('battery');
const range = ref<MetricRange>('1h');

const spec = computed(() => MEASURES[measure.value]);
const { data, state } = useMetricSeries(() => ({
  metric: spec.value.metric,
  scope: 'ups',
  id: props.upsId,
  range: range.value,
}));

const points = computed(() => data.value?.series[0]?.points ?? []);
const last = computed(() => points.value[points.value.length - 1]?.[1] ?? null);
const tone = computed<Tone>(() =>
  measure.value === 'battery' && last.value !== null && last.value < 40
    ? 'danger'
    : spec.value.tone,
);

const measureOptions = computed(() =>
  (['battery', 'load', 'input'] as Measure[]).map((value) => ({
    value,
    label: t(`upsPage.history.${value}`),
  })),
);
const rangeOptions = computed(() =>
  (['1h', '24h', '7d'] as MetricRange[]).map((value) => ({
    value,
    label: t(`upsPage.history.${value}`),
  })),
);
const axis = computed(() => [
  spec.value.max,
  Math.round((spec.value.max + spec.value.min) / 2),
  spec.value.min,
]);
</script>

<template>
  <div class="flex flex-col gap-3.5 border-t border-surface-raised pt-5">
    <div class="flex flex-wrap items-center gap-3">
      <h3 class="m-0 text-card-title text-text-strong">
        {{ t('upsPage.history.title') }}
      </h3>
      <SegmentedControl
        v-model="measure"
        :options="measureOptions"
        :label="t('upsPage.history.measure')"
      />
      <div class="flex-1" />
      <SegmentedControl
        v-model="range"
        :options="rangeOptions"
        :label="t('upsPage.history.period')"
      />
    </div>
    <div
      v-if="
        state === 'unavailable' ||
        state === 'error' ||
        (state === 'ready' && points.length < 2)
      "
      class="grid h-40 place-items-center rounded-[12px] border border-dashed border-border-strong text-text-muted"
      data-part="unavailable"
    >
      {{
        state === 'ready'
          ? t('upsPage.history.empty')
          : t('pulse.chart.unavailable')
      }}
    </div>
    <template v-else>
      <div class="flex gap-3">
        <div
          class="flex h-40 min-w-10 flex-col justify-between text-right font-mono text-[11px] text-text-faint tnum"
        >
          <span v-for="tick in axis" :key="tick"
            >{{ tick }} {{ spec.unit }}</span
          >
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <Sparkline
            :points="points"
            :min="spec.min"
            :max="spec.max"
            :threshold="spec.threshold"
            :tone="tone"
            :height="160"
            :label="
              t('upsPage.history.aria', {
                measure: t(`upsPage.history.${measure}`),
                name: upsName,
                range: t(`upsPage.history.${range}`),
              })
            "
            grid
          />
          <div
            class="flex justify-between font-mono text-[11px] text-text-faint tnum"
          >
            <span>{{ t(`upsPage.history.start_${range}`) }}</span>
            <span>{{ t(`upsPage.history.mid_${range}`) }}</span>
            <span>{{ t('pulse.chart.now') }}</span>
          </div>
        </div>
      </div>
      <span class="text-caption text-text-muted">{{
        t('upsPage.history.note', { step: t(`upsPage.history.step_${range}`) })
      }}</span>
    </template>
  </div>
</template>
