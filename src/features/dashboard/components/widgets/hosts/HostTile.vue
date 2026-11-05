<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { fmt } from '@/shared/utils/fmt';
import type { HostMetrics } from '@/features/servers/types';

const props = defineProps<{ host: HostMetrics; onBattery: boolean }>();

const { t } = useI18n();

const tone = computed(() => {
  if (props.host.health === 'down') return 'down';
  if (props.onBattery) return 'battery';
  if (props.host.health === 'unknown') return 'unknown';
  return 'up';
});

const toneClass = {
  up: 'border-success-border bg-success-surface text-success-text',
  battery:
    'border-warning bg-warning-surface text-warning-text shadow-glow-warning',
  down: 'border-danger-border bg-danger-surface text-danger-text',
  unknown: 'border-dashed border-border-strong text-status-unknown',
};

const cpu = computed(() => fmt.percent(props.host.cpuPercent));
const aria = computed(() => {
  if (tone.value === 'down')
    return t('widgets.hosts.down', { name: props.host.name });
  return t(
    props.onBattery ? 'widgets.hosts.aria_battery' : 'widgets.hosts.aria',
    {
      name: props.host.name,
      cpu: cpu.value,
    },
  );
});
const target = computed(() =>
  props.host.serverId ? `/servers/${props.host.serverId}` : '/servers',
);
</script>

<template>
  <router-link
    :to="target"
    :aria-label="aria"
    :class="[
      'flex h-16 flex-col items-center justify-center gap-1 rounded-md border font-mono text-overline transition-transform duration-[120ms] hover:-translate-y-px',
      toneClass[tone],
    ]"
    :data-tone="tone"
  >
    <span class="max-w-full truncate px-1 text-text-strong">{{
      host.name
    }}</span>
    <span class="tnum">{{ cpu }}</span>
  </router-link>
</template>
