<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { RefreshCw } from 'lucide-vue-next';
import type { WidgetDataState } from './dataState';

withDefaults(
  defineProps<{
    state: WidgetDataState;
    stale?: boolean;
    emptyText?: string;
    lines?: number;
  }>(),
  { stale: false, emptyText: undefined, lines: 3 },
);

const emit = defineEmits<{ retry: [] }>();
const { t } = useI18n();
</script>

<template>
  <div v-if="state === 'loading'" class="flex flex-col gap-3" aria-busy="true">
    <span class="sr-only">{{ t('pulse.loading') }}</span>
    <div
      v-for="line in lines"
      :key="line"
      class="h-4 animate-pulse rounded-sm bg-surface-raised"
      :style="{ width: `${100 - line * 12}%` }"
    />
  </div>
  <div
    v-else-if="state === 'error'"
    role="alert"
    class="flex flex-wrap items-center gap-3 rounded-md border border-danger-border bg-danger-surface px-4 py-3 text-danger-text"
  >
    <span class="flex-1">{{ t('widgets.error') }}</span>
    <button
      type="button"
      class="pulse-press inline-flex h-8 items-center gap-2 rounded-md border border-danger-border px-3 text-caption font-medium hover:bg-danger-surface"
      @click="emit('retry')"
    >
      <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />{{ t('pulse.retry') }}
    </button>
  </div>
  <p v-else-if="state === 'empty'" class="m-0 py-4 text-text-muted">
    {{ emptyText ?? t('widgets.empty') }}
  </p>
  <template v-else>
    <span
      v-if="stale"
      class="self-start rounded-full bg-warning-surface px-2.5 py-0.5 font-mono text-overline uppercase text-warning-text"
      data-part="stale"
      >{{ t('pulse.stale') }}</span
    >
    <slot />
  </template>
</template>
