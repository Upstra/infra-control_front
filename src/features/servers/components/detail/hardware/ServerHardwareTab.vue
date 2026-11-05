<script setup lang="ts">
import { exceeds } from '@/shared/utils/thresholds';
import { DEFAULT_INLET_WARN_C } from '../../../domain/health';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { StatusPill, type HealthState } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import type { Server } from '../../../types';

const props = defineProps<{
  server: Server;
  iloUnreachable: boolean;
  inletWarnC: number | null | undefined;
}>();

const { t } = useI18n();
const now = useNow({ interval: 30_000 });

const HEALTH: Record<string, HealthState> = {
  OK: 'up',
  Warning: 'degraded',
  Critical: 'down',
};

const hardware = computed(() => props.server.hardware ?? null);
const empty = computed(() => {
  if (props.server.ilo)
    return hardware.value ? null : t('serversPage.hardware.no_reading');
  return props.server.type === 'vcenter'
    ? t('serversPage.hardware.none_vcenter', { name: props.server.name })
    : t('serversPage.hardware.none', { name: props.server.name });
});
const psuDegraded = computed(
  () =>
    !!hardware.value?.psu && hardware.value.psu.ok < hardware.value.psu.total,
);
const inletHot = computed(() =>
  exceeds(hardware.value?.inletC, props.inletWarnC ?? DEFAULT_INLET_WARN_C),
);
</script>

<template>
  <p
    v-if="empty"
    class="m-0 rounded-[12px] border border-dashed border-border-strong p-6 text-center text-text-muted"
  >
    {{ empty }}
  </p>
  <div v-else-if="hardware" class="flex flex-col gap-5">
    <dl
      class="m-0 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-6 gap-y-5 font-mono tnum"
    >
      <div class="flex flex-col gap-1">
        <dt class="text-overline text-text-muted">
          {{ t('serversPage.hardware.inlet') }}
        </dt>
        <dd
          :class="[
            'm-0 text-[24px] font-light',
            inletHot ? 'text-warning-text' : 'text-text-strong',
          ]"
        >
          {{ fmt.value(hardware.inletC, '°C') }}
        </dd>
        <span
          v-if="hardware.inletC === null"
          class="font-sans text-caption text-text-muted"
          >{{ t('serversPage.metrics.no_sensor') }}</span
        >
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-overline text-text-muted">
          {{ t('serversPage.hardware.power') }}
        </dt>
        <dd class="m-0 text-[24px] font-light text-text-strong">
          {{ fmt.value(hardware.consumedW, 'W') }}
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-overline text-text-muted">
          {{ t('serversPage.hardware.psu') }}
        </dt>
        <dd
          :class="[
            'm-0 text-[24px] font-light',
            psuDegraded ? 'text-warning-text' : 'text-text-strong',
          ]"
        >
          {{
            hardware.psu
              ? t('serversPage.hardware.psu_value', {
                  ok: hardware.psu.ok,
                  total: hardware.psu.total,
                })
              : fmt.value(null)
          }}
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-overline text-text-muted">
          {{ t('serversPage.hardware.health') }}
        </dt>
        <dd class="m-0">
          <StatusPill
            v-if="hardware.health"
            :state="HEALTH[hardware.health] ?? 'unknown'"
            :label="hardware.health"
          />
          <span v-else class="text-[24px] font-light text-text-faint">{{
            fmt.value(null)
          }}</span>
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-overline text-text-muted">
          {{ t('serversPage.hardware.collected') }}
        </dt>
        <dd class="m-0 text-[20px] font-light text-text-strong">
          {{
            hardware.collectedAt
              ? t('upsPage.metrics.ago', {
                  duration: fmt.since(hardware.collectedAt, now.getTime()),
                })
              : fmt.value(null)
          }}
        </dd>
        <span
          v-if="iloUnreachable"
          class="font-sans text-caption text-danger-text"
          >{{ t('serversPage.metrics.ilo_unreachable') }}</span
        >
      </div>
    </dl>
    <p class="m-0 text-caption text-text-muted">
      {{ t('serversPage.hardware.soon') }}
    </p>
  </div>
</template>
