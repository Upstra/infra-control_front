<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { Siren } from 'lucide-vue-next';
import { fmt } from '@/shared/utils/fmt';
import type { Alert } from '../../types';

const props = defineProps<{ alert: Alert; acknowledgedBy: string | null }>();

const { t } = useI18n();
const now = useNow({ interval: 1000 });

const chip = computed(() => {
  if (!props.alert.acknowledged) return t('alerts.banner.critical');
  return props.acknowledgedBy
    ? t('alerts.banner.acked_by', { user: props.acknowledgedBy.toUpperCase() })
    : t('alerts.banner.acked');
});

const since = computed(() =>
  t('alerts.banner.since', {
    time: fmt.clock(props.alert.openedAt),
    duration: fmt
      .since(props.alert.openedAt, now.value.getTime())
      .toUpperCase(),
  }),
);
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center gap-3">
      <span
        :class="[
          'inline-flex h-7 items-center gap-2 rounded-full px-3 font-mono text-overline',
          alert.acknowledged
            ? 'bg-surface-raised text-text-muted'
            : 'bg-danger-solid text-on-primary',
        ]"
        data-part="chip"
      >
        <Siren class="h-3 w-3" aria-hidden="true" />{{ chip }}
      </span>
      <span
        :class="[
          'font-mono text-overline tnum',
          alert.acknowledged ? 'text-text-muted' : 'text-danger-text',
        ]"
        >{{ since }}</span
      >
    </div>
    <div class="flex flex-col gap-2">
      <h2 class="m-0 text-display text-text-strong">{{ alert.title }}</h2>
      <p class="m-0 max-w-[620px] text-text">{{ alert.message }}</p>
    </div>
  </div>
</template>
