<script setup lang="ts">
import { below, exceeds } from '@/shared/utils/thresholds';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { MetricRing } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { showsReadings, type UpsCondition } from '../../../domain/condition';
import type { BatteryStatus, UpsResponseDto } from '../../../types';

const LOW_RUNTIME = 15;
const LOAD_WARN = 80;
const TEMP_WARN = 30;

const props = defineProps<{
  ups: UpsResponseDto;
  status: BatteryStatus | null;
  condition: UpsCondition;
}>();

const { t } = useI18n();
const now = useNow({ interval: 1000 });

const readings = computed(() =>
  showsReadings(props.condition) ? props.status : null,
);
const telemetry = computed(() => readings.value?.telemetry ?? null);

const metrics = computed(() => {
  const r = readings.value;
  const tel = telemetry.value;
  const responding = !!r;
  const watts = tel?.load.realPowerW ?? null;
  const nominal = props.ups.effectiveNominalPowerW;
  const load = r?.loadPercent ?? null;
  const runtime = r?.minutesRemaining ?? null;
  const temp = tel?.temperatureC ?? null;
  const input = tel?.input.voltage ?? null;
  const loadNote =
    watts !== null
      ? nominal
        ? t('upsPage.metrics.load_watts', {
            watts: fmt.value(watts, 'W'),
            nominal: fmt.value(nominal, 'W'),
          })
        : t('upsPage.metrics.load_watts_only', { watts: fmt.value(watts, 'W') })
      : load === null
        ? t('upsPage.metrics.no_data')
        : t('upsPage.metrics.load_no_watts');
  const device = tel?.device;
  return [
    {
      key: 'runtime',
      large: true,
      value: fmt.minutes(runtime),
      tone:
        props.condition === 'on_battery'
          ? 'text-danger-strong'
          : below(runtime, LOW_RUNTIME)
            ? 'text-warning-text'
            : 'text-text-strong',
      note:
        props.condition === 'replace' ? t('upsPage.metrics.runtime_low') : null,
    },
    {
      key: 'load',
      large: true,
      value: fmt.percent(load),
      tone: exceeds(load, LOAD_WARN) ? 'text-warning-text' : 'text-text-strong',
      note: loadNote,
      bar: load,
    },
    {
      key: 'temperature',
      large: false,
      value: fmt.value(temp, '°C'),
      tone: exceeds(temp, TEMP_WARN) ? 'text-warning-text' : 'text-text-strong',
      note: temp === null && responding ? t('upsPage.metrics.no_probe') : null,
    },
    {
      key: 'input',
      large: false,
      value: fmt.value(input, 'V'),
      tone: input === 0 ? 'text-danger-strong' : 'text-text-strong',
      note: input === 0 ? t('upsPage.metrics.no_mains') : null,
    },
    {
      key: 'output',
      large: false,
      value: fmt.value(tel?.output.voltage, 'V'),
      tone: 'text-text-strong',
      note: null,
    },
    {
      key: 'last_reading',
      large: false,
      value: tel?.collectedAt
        ? t('upsPage.metrics.ago', {
            duration: fmt.since(tel.collectedAt, now.value.getTime()),
          })
        : fmt.clock(r?.timestamp),
      tone: r ? 'text-text-strong' : 'text-text-muted',
      note:
        [
          tel?.source?.toUpperCase(),
          [device?.manufacturer, device?.model].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(' · ') || null,
    },
  ];
});

const batteryAria = computed(() =>
  t('upsPage.metrics.battery_aria', {
    name: props.ups.name,
    value: fmt.percent(readings.value?.batteryPercentage),
  }),
);
</script>

<template>
  <div class="flex flex-wrap items-center gap-9">
    <MetricRing
      :value="readings?.batteryPercentage ?? null"
      :size="176"
      :caption="t('upsPage.metrics.battery')"
      :aria-label="batteryAria"
    />
    <dl
      class="m-0 grid flex-[1_1_320px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-5 font-mono tnum"
    >
      <div
        v-for="metric in metrics"
        :key="metric.key"
        class="flex flex-col gap-1"
        :data-metric="metric.key"
      >
        <dt class="text-overline text-text-muted">
          {{ t(`upsPage.metrics.${metric.key}`) }}
        </dt>
        <dd
          :class="[
            'm-0 whitespace-nowrap font-light tracking-[-0.01em]',
            metric.large ? 'text-[32px] leading-9' : 'text-[20px] leading-6',
            metric.tone,
          ]"
        >
          {{ metric.value }}
        </dd>
        <span
          v-if="metric.note"
          class="font-sans text-caption text-text-muted"
          >{{ metric.note }}</span
        >
        <div
          v-if="
            'bar' in metric && metric.bar !== null && metric.bar !== undefined
          "
          class="mt-1 h-1 overflow-hidden rounded-full bg-border"
        >
          <div
            :class="[
              'h-full rounded-full transition-[width] duration-700 ease-pulse',
              metric.bar > LOAD_WARN ? 'bg-warning' : 'bg-primary-hover',
            ]"
            :style="{ width: `${Math.min(100, metric.bar)}%` }"
          />
        </div>
      </div>
    </dl>
  </div>
</template>
