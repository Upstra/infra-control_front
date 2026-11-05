<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TriangleAlert, Info } from 'lucide-vue-next';
import { fmt } from '@/shared/utils/fmt';
import type { Countdown } from '../../../domain/countdown';
import type { UpsCondition } from '../../../domain/condition';
import type { BatteryStatus } from '../../../types';

const props = defineProps<{
  condition: UpsCondition;
  status: BatteryStatus | null;
  countdown: Countdown | null;
  outageStart: string | null;
}>();

const { t } = useI18n();

const content = computed(() => {
  const s = props.status;
  switch (props.condition) {
    case 'on_battery': {
      const c = props.countdown;
      if (!c || !props.outageStart) {
        return {
          tone: 'danger',
          title: t('upsPage.callout.on_battery_title_unknown'),
          text: t('upsPage.callout.on_battery_unknown'),
        };
      }
      return {
        tone: 'danger',
        title: t('upsPage.callout.on_battery_title', {
          elapsed: fmt.countdown(c.elapsedSeconds),
          clock: fmt.clock(props.outageStart),
        }),
        text: c.expired
          ? t('upsPage.callout.on_battery_expired')
          : t('upsPage.callout.on_battery_text', {
              stopAt: fmt.clock(c.stopAt),
            }),
      };
    }
    case 'overload':
      return {
        tone: 'warning',
        title: t('upsPage.callout.overload_title', {
          percent: fmt.percent(s?.loadPercent),
        }),
        text: t('upsPage.callout.overload_text'),
      };
    case 'replace':
      return {
        tone: 'warning',
        title: t('upsPage.callout.replace_title'),
        text: t('upsPage.callout.replace_text', {
          runtime: fmt.minutes(s?.minutesRemaining),
        }),
      };
    case 'unreachable':
    case 'pending':
    case 'unknown_mains':
      return {
        tone: 'neutral',
        title: t(`upsPage.callout.${props.condition}_title`),
        text: t(`upsPage.callout.${props.condition}_text`),
      };
    default:
      return null;
  }
});

const toneClass: Record<string, string> = {
  danger: 'callout-danger border-danger-border',
  warning: 'border-warning/40 bg-warning-surface',
  neutral: 'border-dashed border-border-strong',
};
const iconClass: Record<string, string> = {
  danger: 'text-danger',
  warning: 'text-warning',
  neutral: 'text-status-unknown',
};
</script>

<template>
  <div
    v-if="content"
    role="status"
    :class="[
      'flex items-start gap-3.5 rounded-[14px] border px-[18px] py-4',
      toneClass[content.tone],
    ]"
    :data-tone="content.tone"
  >
    <TriangleAlert
      v-if="content.tone !== 'neutral'"
      :class="['mt-px h-[18px] w-[18px] flex-none', iconClass[content.tone]]"
      aria-hidden="true"
    />
    <Info
      v-else
      class="mt-px h-[18px] w-[18px] flex-none text-status-unknown"
      aria-hidden="true"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="font-medium text-text-strong">{{ content.title }}</span>
      <span class="text-text">{{ content.text }}</span>
    </div>
    <div
      v-if="condition === 'on_battery' && countdown"
      class="flex flex-none flex-col items-end font-mono tnum"
      data-part="countdown"
    >
      <span class="text-overline text-danger-text">{{
        t('upsPage.callout.countdown')
      }}</span>
      <span class="text-[28px] font-light leading-8 text-text-strong">{{
        fmt.countdown(countdown.remainingSeconds)
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.callout-danger {
  background: radial-gradient(
    ellipse at left,
    rgb(var(--c-danger) / 0.14),
    rgb(var(--c-surface)) 60%
  );
}
</style>
