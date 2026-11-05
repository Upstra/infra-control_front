<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MetricRing } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { useUpsLiveStore } from '@/features/ups/liveStore';

const props = defineProps<{ upsId: string }>();

const { t } = useI18n();
const upsLive = useUpsLiveStore();
const status = computed(() => upsLive.statusById[props.upsId] ?? null);
const telemetry = computed(() => status.value?.telemetry ?? null);

const load = computed(() => {
  const watts = fmt.value(telemetry.value?.load.realPowerW, 'W');
  const percent = fmt.percent(status.value?.loadPercent);
  return `${watts} · ${percent}`;
});
const inputVoltage = computed(() => telemetry.value?.input.voltage ?? null);
</script>

<template>
  <div class="flex flex-wrap items-center gap-10">
    <MetricRing
      :value="status?.batteryPercentage ?? null"
      :size="176"
      :caption="t('alerts.banner.battery')"
    />
    <dl class="m-0 flex flex-col gap-4 font-mono tnum">
      <div>
        <dt class="text-overline text-text-muted">
          {{ t('alerts.banner.runtime') }}
        </dt>
        <dd class="m-0 whitespace-nowrap text-metric text-danger-strong">
          {{ fmt.minutes(status?.minutesRemaining) }}
        </dd>
      </div>
      <div>
        <dt class="text-overline text-text-muted">
          {{ t('alerts.banner.load') }}
        </dt>
        <dd
          class="m-0 whitespace-nowrap text-[20px] leading-[26px] text-text-strong"
        >
          {{ load }}
        </dd>
      </div>
      <div>
        <dt class="text-overline text-text-muted">
          {{ t('alerts.banner.input') }}
        </dt>
        <dd
          :class="[
            'm-0 whitespace-nowrap text-[20px] leading-[26px]',
            inputVoltage === 0 ? 'text-danger-strong' : 'text-text-strong',
          ]"
        >
          {{ fmt.value(inputVoltage, 'V') }}
        </dd>
      </div>
    </dl>
  </div>
</template>
