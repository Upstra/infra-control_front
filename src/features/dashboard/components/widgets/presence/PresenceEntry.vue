<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { fmt } from '@/shared/utils/fmt';
import { presenceLine } from '@/features/presence/domain/entry';
import type { PresenceView } from '@/features/presence/types';

const props = defineProps<{
  view: PresenceView;
  name: string;
  self: boolean;
}>();

const { t } = useI18n();
const now = useNow({ interval: 30_000 });

const line = computed(() => presenceLine(props.view));
const idle = computed(() => line.value.kind === 'idle');
const label = computed(() =>
  props.self ? t('widgets.presence.you', { name: props.name }) : props.name,
);
const where = computed(() => {
  const value = line.value;
  if (value.kind === 'page') return value.title;
  if (value.kind === 'idle')
    return t('widgets.presence.idle', {
      duration: fmt.since(value.since, now.value.getTime()),
    });
  return null;
});
const initials = computed(() => props.name.slice(0, 2).toUpperCase());
</script>

<template>
  <li class="flex items-center gap-3" :data-status="view.status ?? 'unknown'">
    <span
      class="relative grid h-9 w-9 flex-none place-items-center rounded-full border border-border-strong bg-surface-raised text-caption text-text-strong"
    >
      {{ initials }}
      <span
        :class="[
          'absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-surface',
          idle ? 'bg-warning' : 'bg-success',
        ]"
        :aria-label="
          t('widgets.presence.aria', {
            name,
            state: idle ? where : t('widgets.presence.active'),
          })
        "
      />
    </span>
    <span class="flex min-w-0 flex-col">
      <span class="truncate font-medium text-text-strong">{{ label }}</span>
      <span
        v-if="where"
        :class="[
          'truncate text-caption',
          idle ? 'text-warning-text' : 'text-text-muted',
        ]"
        data-part="where"
        >{{ where }}</span
      >
    </span>
  </li>
</template>
