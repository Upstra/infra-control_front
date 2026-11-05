<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Home, Plus, SlidersHorizontal } from 'lucide-vue-next';
import type { Board } from '../../store';

defineProps<{
  boards: Board[];
  activeId: string | null;
  editing: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  create: [];
  customize: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 border-b border-surface-raised pb-1"
  >
    <div
      role="tablist"
      :aria-label="t('boards.tabs')"
      class="flex flex-wrap items-center gap-1"
    >
      <button
        v-for="board in boards"
        :key="board.id"
        type="button"
        role="tab"
        :aria-selected="board.id === activeId"
        :class="[
          'pulse-press inline-flex h-10 items-center gap-2 border-b-2 px-3 font-medium',
          board.id === activeId
            ? 'border-primary-hover text-text-strong'
            : 'border-transparent text-text-muted hover:text-text-strong',
        ]"
        @click="emit('select', board.id)"
      >
        <Home
          v-if="board.isDefault"
          class="h-4 w-4"
          :aria-label="t('boards.default')"
        />
        {{ board.name }}
        <span class="font-mono text-overline text-text-faint tnum">{{
          board.widgets.length
        }}</span>
      </button>
      <button
        type="button"
        class="pulse-press grid h-10 w-10 place-items-center rounded-md border border-dashed border-border-strong text-text-muted hover:text-text-strong"
        :aria-label="t('boards.new')"
        @click="emit('create')"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
    <div class="flex-1" />
    <button
      v-if="!editing"
      type="button"
      class="pulse-press inline-flex h-10 items-center gap-2 rounded-md border border-border-strong px-4 font-medium text-text-strong hover:bg-surface-raised"
      @click="emit('customize')"
    >
      <SlidersHorizontal class="h-4 w-4" aria-hidden="true" />{{
        t('boards.customize')
      }}
    </button>
  </div>
</template>
