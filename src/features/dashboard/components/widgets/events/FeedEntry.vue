<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { fmt } from '@/shared/utils/fmt';
import type { FeedItem } from '@/features/events/types';

const props = defineProps<{ item: FeedItem; last: boolean }>();

const { t } = useI18n();

const tone = computed(() => {
  if (props.item.event === 'resolved') return 'ok';
  if (props.item.kind === 'action') return 'info';
  return props.item.tone === 'critical'
    ? 'crit'
    : props.item.tone === 'warning'
      ? 'warn'
      : 'info';
});

const dotClass = {
  crit: 'bg-danger shadow-[0_0_10px_1px_rgb(var(--c-danger)/0.8)]',
  warn: 'bg-warning',
  ok: 'bg-success shadow-glow-dot',
  info: 'border-[1.5px] border-primary-text bg-transparent',
};

const strong = computed(() => tone.value === 'crit' || tone.value === 'ok');
const meta = computed(
  () =>
    [
      fmt.clock(props.item.at),
      props.item.resource?.name ?? null,
      props.item.by?.username ?? null,
    ]
      .filter(Boolean)
      .join(' · ') || t('widgets.events.system'),
);
</script>

<template>
  <li class="flex items-stretch gap-4" :data-tone="tone">
    <div class="flex w-2.5 flex-col items-center pt-1.5">
      <span :class="['h-2.5 w-2.5 flex-none rounded-full', dotClass[tone]]" />
      <span v-if="!last" class="mt-1 min-h-[18px] w-px flex-1 bg-border" />
    </div>
    <div class="flex min-w-0 flex-col gap-0.5 pb-[18px]">
      <span :class="strong ? 'font-medium text-text-strong' : 'text-text'">{{
        item.title
      }}</span>
      <span
        class="font-mono text-overline tracking-[0.04em] text-text-muted tnum"
        >{{ meta }}</span
      >
    </div>
  </li>
</template>
