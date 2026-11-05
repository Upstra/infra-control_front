<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Layers, Trash2, ArrowRight } from 'lucide-vue-next';
import { fmt } from '@/shared/utils/fmt';
import { isInletWarning } from '../domain/thresholds';
import type { Room, RoomEnvironment } from '../types';

const props = defineProps<{
  room: Room;
  environment: RoomEnvironment | null;
  viewMode?: 'grid' | 'list';
  canDelete?: boolean;
}>();

const emit = defineEmits<{ delete: [room: Room] }>();
const { t } = useI18n();

const warning = computed(() =>
  isInletWarning(props.environment?.maxInletC, props.room.inletWarnC),
);
const envLine = computed(() =>
  props.environment
    ? t('roomsPage.env_line', {
        inlet: fmt.value(props.environment.maxInletC, '°C'),
        power: fmt.value(props.environment.totalConsumedW, 'W'),
      })
    : null,
);
</script>

<template>
  <article
    :class="[
      'group flex gap-4 rounded-lg border bg-surface p-6 shadow-sm transition-colors duration-[120ms]',
      warning ? 'border-warning' : 'border-border hover:border-border-strong',
      viewMode === 'list' ? 'flex-row items-center' : 'flex-col',
    ]"
    :data-warning="warning"
  >
    <div class="flex items-center gap-3">
      <span
        class="grid h-10 w-10 flex-none place-items-center rounded-md border border-border bg-surface-raised text-primary-text"
      >
        <Layers class="h-5 w-5" aria-hidden="true" />
      </span>
      <router-link
        :to="`/rooms/${room.id}`"
        class="truncate text-card-title text-text-strong hover:text-primary-text"
        >{{ room.name }}</router-link
      >
      <button
        v-if="canDelete"
        type="button"
        class="ml-auto grid h-8 w-8 place-items-center rounded-sm text-text-muted opacity-0 transition-opacity hover:bg-danger-surface hover:text-danger-text focus-visible:opacity-100 group-hover:opacity-100"
        :aria-label="t('roomsPage.delete', { name: room.name })"
        @click="emit('delete', room)"
      >
        <Trash2 class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
    <div
      class="flex flex-1 flex-wrap gap-x-4 gap-y-1 font-mono text-caption text-text-muted tnum"
    >
      <span>{{ t('roomsPage.servers', room.serverCount ?? 0) }}</span>
      <span>{{ t('roomsPage.ups', room.upsCount ?? 0) }}</span>
    </div>
    <span
      v-if="envLine"
      :class="[
        'font-mono text-caption tnum',
        warning ? 'text-warning-text' : 'text-text-muted',
      ]"
      data-part="environment"
      >{{ envLine }}</span
    >
    <router-link
      :to="`/rooms/${room.id}`"
      class="inline-flex items-center gap-1.5 self-start text-caption font-medium text-primary-text"
      :aria-label="t('roomsPage.open', { name: room.name })"
    >
      {{ t('roomsPage.open', { name: room.name })
      }}<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
    </router-link>
  </article>
</template>
