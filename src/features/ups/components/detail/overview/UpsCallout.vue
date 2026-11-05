<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Callout, type CalloutTone } from '@/shared/components/pulse';
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

const content = computed<{
  tone: CalloutTone;
  title: string;
  text: string;
} | null>(() => {
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
</script>

<template>
  <Callout
    v-if="content"
    :tone="content.tone"
    :title="content.title"
    :text="content.text"
  >
    <template v-if="condition === 'on_battery' && countdown" #aside>
      <div
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
    </template>
  </Callout>
</template>
