<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { StatusPill } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import type { Countdown } from '../../../domain/countdown';
import type { Server } from '@/features/servers/types';

const props = defineProps<{
  server: Server;
  order: number;
  onBattery: boolean;
  countdown: Countdown | null;
  gracePeriodOff: number;
}>();

const { t } = useI18n();

const stopping = computed(() => props.onBattery && !!props.countdown?.expired);
const state = computed(() => {
  if (stopping.value)
    return {
      health: 'degraded' as const,
      label: t('upsPage.servers.stopping'),
    };
  return props.server.state === 'UP'
    ? { health: 'up' as const, label: t('upsPage.servers.on') }
    : { health: 'down' as const, label: t('upsPage.servers.off') };
});
const stop = computed(() => {
  if (!props.onBattery)
    return t('upsPage.servers.stop_after', {
      time: fmt.countdown(props.gracePeriodOff),
    });
  if (!props.countdown) return fmt.countdown(null);
  return props.countdown.expired
    ? t('upsPage.servers.stop_running')
    : t('upsPage.servers.stop_in', {
        time: fmt.countdown(props.countdown.remainingSeconds),
      });
});
</script>

<template>
  <div
    class="grid grid-cols-[0.6fr_2.4fr_1fr_1.2fr_1.4fr] items-center gap-3 border-t border-surface-raised px-4 py-3.5 transition-colors hover:bg-surface-raised"
  >
    <span class="font-mono text-text-muted tnum">{{ order }}</span>
    <span class="flex min-w-0 flex-col">
      <router-link
        :to="`/servers/${server.id}`"
        class="truncate font-mono text-text-strong hover:text-primary-text"
        >{{ server.name }}</router-link
      >
      <span class="text-caption text-text-muted">{{
        t('upsPage.servers.meta', {
          type: server.type.toUpperCase(),
          priority: server.priority,
        })
      }}</span>
    </span>
    <StatusPill :state="state.health" :label="state.label" bare />
    <span
      :class="[
        'text-right font-mono tnum',
        server.hardware?.consumedW == null ? 'text-text-faint' : 'text-text',
      ]"
      >{{ fmt.value(server.hardware?.consumedW, 'W') }}</span
    >
    <span
      :class="[
        'whitespace-nowrap text-right font-mono tnum',
        onBattery ? 'text-danger-text' : 'text-text-muted',
      ]"
      >{{ stop }}</span
    >
  </div>
</template>
