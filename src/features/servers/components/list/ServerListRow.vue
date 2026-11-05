<script setup lang="ts">
import { exceeds } from '@/shared/utils/thresholds';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { StatusGlyph } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { CPU_WARN, pillState } from '../../domain/health';
import { useServerReason } from '../../composables/useServerReason';
import type { ServerRowModel } from '../../domain/row';

const props = defineProps<{ row: ServerRowModel; selected: boolean }>();
const emit = defineEmits<{ select: [] }>();

const { t } = useI18n();
const { lineOf } = useServerReason();

const state = computed(() => pillState(props.row.health.state));
const line = computed(() => lineOf(props.row));
const lineClass: Record<string, string> = {
  up: 'text-text-muted',
  degraded: 'text-warning-text',
  down: 'text-danger-text',
  unknown: 'text-status-unknown',
  busy: 'text-primary-text',
};
const hot = computed(() => exceeds(props.row.cpu, CPU_WARN));
</script>

<template>
  <button
    type="button"
    :aria-current="selected ? 'true' : undefined"
    :class="[
      'flex w-full items-center gap-3.5 border-b border-surface-raised px-4 py-3.5 text-left transition-colors duration-[120ms] hover:bg-surface-raised',
      selected &&
        'bg-surface-raised shadow-[inset_3px_0_0_0_rgb(var(--c-primary-hover))]',
    ]"
    :data-health="row.health.state"
    @click="emit('select')"
  >
    <StatusGlyph :state="state" :size="12" />
    <span class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="flex items-center gap-2">
        <span class="truncate font-mono text-text-strong">{{
          row.server.name
        }}</span>
        <span class="font-mono text-overline uppercase text-text-muted">{{
          row.server.type
        }}</span>
      </span>
      <span :class="['truncate text-caption', lineClass[row.health.state]]">{{
        line
      }}</span>
    </span>
    <span class="flex w-24 flex-none flex-col items-end gap-1.5">
      <span
        :class="[
          'font-mono tnum',
          hot ? 'text-warning-text' : 'text-text-strong',
        ]"
        >{{ fmt.percent(row.cpu) }}</span
      >
      <span
        v-if="row.cpu !== null"
        class="h-1 w-full overflow-hidden rounded-full bg-border"
      >
        <span
          :class="[
            'block h-full rounded-full',
            hot ? 'bg-warning' : 'bg-primary-hover',
          ]"
          :style="{ width: `${Math.min(100, row.cpu)}%` }"
        />
      </span>
      <span v-else class="text-overline text-text-faint">{{
        t('serversPage.metrics.cpu')
      }}</span>
    </span>
  </button>
</template>
