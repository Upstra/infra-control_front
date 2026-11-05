<script setup lang="ts">
import { exceeds } from '@/shared/utils/thresholds';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { fmt } from '@/shared/utils/fmt';
import { CPU_WARN, DEFAULT_INLET_WARN_C } from '../../../domain/health';
import type { ServerRowModel } from '../../../domain/row';

const MEMORY_WARN = 85;

const props = defineProps<{
  row: ServerRowModel;
  vmsOn: number;
  vmsTotal: number;
  iloUnreachable: boolean;
  inletWarnC: number | null | undefined;
}>();

const { t } = useI18n();

const readings = computed(() => {
  const { server, host, health } = props.row;
  const live = health.state !== 'down' && health.state !== 'unknown' && !!host;
  const liveNote =
    health.state === 'unknown'
      ? t('serversPage.metrics.pending')
      : health.state === 'down'
        ? t('serversPage.metrics.powered_off')
        : t('serversPage.metrics.no_measure');
  const iloNote = !server.ilo
    ? t('serversPage.metrics.no_ilo')
    : props.iloUnreachable
      ? t('serversPage.metrics.ilo_unreachable')
      : null;
  const hardware = server.hardware;
  const cpu = live ? (host?.cpuPercent ?? null) : null;
  const memory = live ? (host?.memoryPercent ?? null) : null;
  const inlet = hardware?.inletC ?? null;
  const vcenter = server.type === 'vcenter';
  return [
    {
      key: 'cpu',
      value: fmt.percent(cpu),
      warn: exceeds(cpu, CPU_WARN),
      bar: cpu,
      note: cpu === null ? liveNote : null,
    },
    {
      key: 'memory',
      value: fmt.percent(memory),
      warn: exceeds(memory, MEMORY_WARN),
      bar: memory,
      note: memory === null ? liveNote : null,
    },
    {
      key: vcenter ? 'inventory' : 'vms',
      value: vcenter ? fmt.value(null) : `${props.vmsOn} / ${props.vmsTotal}`,
      warn: false,
      bar: null,
      note:
        !vcenter && props.vmsTotal > props.vmsOn
          ? t(
              'serversPage.metrics.stopped',
              { count: props.vmsTotal - props.vmsOn },
              props.vmsTotal - props.vmsOn,
            )
          : null,
    },
    {
      key: 'uptime',
      value: fmt.duration(live ? host?.uptimeSeconds : null),
      warn: false,
      bar: null,
      note: null,
    },
    {
      key: 'power',
      value: fmt.value(hardware?.consumedW, 'W'),
      warn: false,
      bar: null,
      note:
        hardware?.consumedW == null
          ? (iloNote ?? t('serversPage.metrics.no_measure'))
          : null,
    },
    {
      key: 'inlet',
      value: fmt.value(inlet, '°C'),
      warn:
        inlet !== null && inlet > (props.inletWarnC ?? DEFAULT_INLET_WARN_C),
      bar: null,
      note:
        inlet === null
          ? (iloNote ??
            (hardware
              ? t('serversPage.metrics.no_sensor')
              : t('serversPage.metrics.no_measure')))
          : null,
    },
  ];
});
</script>

<template>
  <dl
    class="m-0 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-5 font-mono tnum"
  >
    <div
      v-for="reading in readings"
      :key="reading.key"
      class="flex flex-col gap-1"
      :data-metric="reading.key"
    >
      <dt class="text-overline text-text-muted">
        {{ t(`serversPage.metrics.${reading.key}`) }}
      </dt>
      <dd
        :class="[
          'm-0 whitespace-nowrap text-[24px] font-light leading-7',
          reading.warn ? 'text-warning-text' : 'text-text-strong',
        ]"
      >
        {{ reading.value }}
      </dd>
      <span
        v-if="reading.note"
        class="font-sans text-caption text-text-muted"
        data-part="note"
        >{{ reading.note }}</span
      >
      <div
        v-if="reading.bar !== null"
        class="mt-1 h-1 overflow-hidden rounded-full bg-border"
      >
        <div
          :class="[
            'h-full rounded-full transition-[width] duration-700 ease-pulse',
            reading.warn ? 'bg-warning' : 'bg-primary-hover',
          ]"
          :style="{ width: `${Math.min(100, reading.bar)}%` }"
        />
      </div>
    </div>
  </dl>
</template>
