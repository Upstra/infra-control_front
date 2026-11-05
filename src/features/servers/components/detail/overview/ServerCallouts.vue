<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Callout, type CalloutTone } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import { useUpsCountdown } from '@/features/ups/composables/useUpsCountdown';
import { useUnreachableUps } from '@/features/ups/composables/useUnreachableUps';
import { DEFAULT_INLET_WARN_C } from '../../../domain/health';
import type { ServerRowModel } from '../../../domain/row';
import type { Vm } from '@/features/vms/types';

interface CalloutModel {
  key: string;
  tone: CalloutTone;
  title: string;
  text: string;
}

const props = defineProps<{
  row: ServerRowModel;
  vms: Vm[];
  iloUnreachable: boolean;
  inletWarnC: number | null | undefined;
}>();

const { t } = useI18n();
const upsLive = useUpsLiveStore();
const unreachableUps = useUnreachableUps();
const ups = computed(() =>
  props.row.server.upsId
    ? (upsLive.byId[props.row.server.upsId] ?? null)
    : null,
);
const { countdown } = useUpsCountdown(ups);
const onBattery = computed(() =>
  props.row.health.reasons.some((reason) => reason.kind === 'on_battery'),
);

const callouts = computed<CalloutModel[]>(() => {
  const { server, health } = props.row;
  const list: CalloutModel[] = [];
  const hardware = server.hardware;
  const threshold = props.inletWarnC ?? DEFAULT_INLET_WARN_C;
  const room = props.row.roomName ?? t('pulse.empty');
  if (onBattery.value) {
    const c = countdown.value;
    list.push({
      key: 'battery',
      tone: 'danger',
      title: c
        ? t('serversPage.callout.on_battery_title', {
            ups: props.row.upsName ?? '',
            elapsed: fmt.countdown(c.elapsedSeconds),
          })
        : t('serversPage.callout.on_battery_title_unknown', {
            ups: props.row.upsName ?? '',
          }),
      text: c?.expired
        ? t('serversPage.callout.on_battery_expired')
        : t('serversPage.callout.on_battery_text', {
            stopAt: fmt.clock(c?.stopAt),
            priority: server.priority,
          }),
    });
  }
  if (hardware?.psu && hardware.psu.ok < hardware.psu.total) {
    list.push({
      key: 'psu',
      tone: 'warning',
      title: t('serversPage.callout.psu_title'),
      text: t('serversPage.callout.psu_text', {
        ok: hardware.psu.ok,
        total: hardware.psu.total,
      }),
    });
  }
  if (hardware?.inletC != null && hardware.inletC > threshold) {
    list.push({
      key: 'inlet',
      tone: 'warning',
      title: t('serversPage.callout.inlet_title', {
        value: fmt.value(hardware.inletC, '°C'),
        room,
        threshold: fmt.value(threshold, '°C'),
      }),
      text: t('serversPage.callout.inlet_text'),
    });
  }
  if (hardware?.health === 'Warning' || hardware?.health === 'Critical') {
    list.push({
      key: 'hardware',
      tone: 'warning',
      title: t('serversPage.callout.hardware_title', {
        health: hardware.health,
      }),
      text: t('serversPage.callout.hardware_text'),
    });
  }
  if (server.ilo && props.iloUnreachable) {
    list.push({
      key: 'ilo',
      tone: 'neutral',
      title: t('serversPage.callout.ilo_title'),
      text: t('serversPage.callout.ilo_text'),
    });
  }
  if (health.state === 'down' && health.reasons[0]?.kind === 'disconnected') {
    const upsDown = !!server.upsId && unreachableUps.value.has(server.upsId);
    list.push({
      key: 'down',
      tone: 'danger',
      title: t('serversPage.callout.down_title'),
      text: upsDown
        ? t('serversPage.callout.down_text_ups', {
            ups: props.row.upsName ?? '',
          })
        : t('serversPage.callout.down_text'),
    });
  }
  const degraded = props.vms.filter((vm) => vm.health === 'degraded');
  if (degraded.length) {
    list.push({
      key: 'vms',
      tone: 'warning',
      title: t(
        'serversPage.callout.vm_title',
        { count: degraded.length },
        degraded.length,
      ),
      text: t('serversPage.callout.vm_text', {
        list: degraded
          .map((vm) => `${vm.name} · ${fmt.percent(vm.cpuPercent)}`)
          .join(', '),
      }),
    });
  }
  return list;
});
</script>

<template>
  <div v-if="callouts.length" class="flex flex-col gap-3">
    <Callout
      v-for="callout in callouts"
      :key="callout.key"
      :tone="callout.tone"
      :title="callout.title"
      :text="callout.text"
      :data-callout="callout.key"
    >
      <template
        v-if="callout.key === 'battery' && countdown && !countdown.expired"
        #aside
      >
        <div class="flex flex-none flex-col items-end font-mono tnum">
          <span class="text-overline text-danger-text">{{
            t('serversPage.callout.countdown')
          }}</span>
          <span class="text-[28px] font-light leading-8 text-text-strong">{{
            fmt.countdown(countdown.remainingSeconds)
          }}</span>
        </div>
      </template>
    </Callout>
  </div>
</template>
