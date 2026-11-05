<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { StatusPill } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import {
  vmHealth,
  vmHealthState,
  vmStateLabel,
} from '@/features/vms/domain/presentation';
import type { Vm } from '@/features/vms/types';

const CPU_WARN = 90;

const props = defineProps<{ vm: Vm; hostName: string | null }>();

const { t } = useI18n();
const now = useNow({ interval: 30_000 });

const health = computed(() => vmHealth(props.vm));
const label = computed(() => {
  const { key, params } = vmStateLabel(props.vm);
  return t(key, params ?? {});
});
const meta = computed(() =>
  [props.vm.ip, props.vm.numCPU ? `${props.vm.numCPU} vCPU` : null]
    .filter(Boolean)
    .join(' · '),
);
const cpu = computed(() => props.vm.cpuPercent ?? null);
const hot = computed(() => (cpu.value ?? 0) > CPU_WARN);
const uptime = computed(() => {
  if (health.value === 'down' && props.vm.powerOff) {
    return t('widgets.vms.down_for', {
      duration: fmt.since(props.vm.powerOff.at, now.value.getTime()),
    });
  }
  return fmt.duration(props.vm.uptimeSeconds);
});
</script>

<template>
  <div
    :class="[
      'grid grid-cols-[3fr_2fr_1.5fr_3fr_1.5fr] items-center gap-4 border-t border-border px-6 py-4 transition-colors duration-[120ms]',
      health === 'down'
        ? 'bg-[rgb(var(--c-danger)/0.06)] hover:bg-[rgb(var(--c-danger)/0.1)]'
        : 'hover:bg-surface-raised',
    ]"
    :data-health="health"
  >
    <div class="flex min-w-0 flex-col">
      <span class="truncate font-mono text-text-strong">{{ vm.name }}</span>
      <span class="truncate text-caption text-text-muted tnum">{{
        meta || t('pulse.empty')
      }}</span>
    </div>
    <StatusPill :state="vmHealthState(vm)" :label="label" bare />
    <span class="truncate font-mono text-text">{{
      hostName ?? t('pulse.empty')
    }}</span>
    <div v-if="cpu !== null" class="flex items-center gap-3">
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          :class="[
            'h-full rounded-full transition-[width] duration-700 ease-pulse',
            hot ? 'bg-warning shadow-glow-warning' : 'bg-primary-hover',
          ]"
          :style="{ width: `${Math.min(100, cpu)}%` }"
        />
      </div>
      <span
        :class="[
          'w-12 text-right font-mono tnum',
          hot ? 'text-warning-text' : 'text-text',
        ]"
        >{{ fmt.percent(cpu) }}</span
      >
    </div>
    <span v-else class="text-caption text-text-muted">{{
      health === 'unknown' ? t('widgets.vms.no_data') : t('pulse.empty')
    }}</span>
    <span
      :class="[
        'whitespace-nowrap text-right font-mono tnum',
        health === 'down' ? 'text-danger-text' : 'text-text-muted',
      ]"
      >{{ uptime }}</span
    >
  </div>
</template>
