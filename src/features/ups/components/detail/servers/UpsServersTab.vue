<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import UpsServerRow from './UpsServerRow.vue';
import { useUpsCountdown } from '../../../composables/useUpsCountdown';
import { fmt } from '@/shared/utils/fmt';
import type { Server } from '@/features/servers/types';
import type { UpsResponseDto } from '../../../types';

const props = defineProps<{
  ups: UpsResponseDto;
  servers: Server[];
  onBattery: boolean;
}>();

const { t } = useI18n();
const { countdown } = useUpsCountdown(toRef(props, 'ups'));

const plan = computed(() => {
  const off = fmt.countdown(props.ups.grace_period_off);
  const on = fmt.countdown(props.ups.grace_period_on);
  return props.onBattery && countdown.value
    ? t('upsPage.servers.plan_outage', {
        stopAt: fmt.clock(countdown.value.stopAt),
        off,
        on,
      })
    : t('upsPage.servers.plan', { off, on });
});
const columns = computed(() =>
  ['order', 'server', 'state', 'power', 'stop'].map((key) =>
    t(`upsPage.servers.${key}`),
  ),
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <span class="text-text">{{ plan }}</span>
      <span class="text-caption text-text-muted">{{
        t('upsPage.servers.plan_hint')
      }}</span>
    </div>
    <div class="overflow-x-auto rounded-[12px] border border-border">
      <div class="min-w-[560px]">
        <div
          class="grid grid-cols-[0.6fr_2.4fr_1fr_1.2fr_1.4fr] gap-3 px-4 py-2.5 font-mono text-overline text-text-muted"
        >
          <span
            v-for="(column, index) in columns"
            :key="column"
            :class="index > 2 ? 'text-right' : ''"
            >{{ column }}</span
          >
        </div>
        <UpsServerRow
          v-for="(server, index) in servers"
          :key="server.id"
          :server="server"
          :order="index + 1"
          :on-battery="onBattery"
          :countdown="countdown"
          :grace-period-off="ups.grace_period_off"
        />
        <p
          v-if="!servers.length"
          class="m-0 border-t border-surface-raised px-4 py-6 text-center text-text-muted"
        >
          {{ t('upsPage.servers.empty') }}
        </p>
      </div>
    </div>
  </div>
</template>
