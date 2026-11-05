<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  GripVertical,
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  X,
} from 'lucide-vue-next';
import { specOf } from '../../domain/catalog';
import type { BoardWidget } from '../../domain/layout';

const props = defineProps<{
  widget: BoardWidget;
  editing: boolean;
  first: boolean;
  last: boolean;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  resize: [];
  remove: [];
}>();

const { t } = useI18n();
const name = computed(() => t(`widgets.types.${props.widget.type}.label`));
const fixed = computed(
  () => (specOf(props.widget.type)?.widths.length ?? 1) < 2,
);
const sizeLabel = computed(() =>
  fixed.value
    ? t('boards.frame.full')
    : t('boards.frame.width', { width: props.widget.width }),
);
</script>

<template>
  <div
    :class="[
      'widget relative min-w-0 rounded-[18px]',
      editing && 'widget-editing',
    ]"
    :style="{ gridColumn: `span ${widget.width} / span ${widget.width}` }"
    :data-widget="widget.type"
  >
    <div
      v-if="editing"
      class="mb-2.5 flex items-center gap-1.5 rounded-[12px] border border-border bg-surface py-1 pl-2.5 pr-1"
    >
      <GripVertical
        class="widget-handle h-4 w-4 cursor-grab text-text-muted"
        :aria-label="t('boards.frame.drag', { name })"
      />
      <span class="truncate font-medium text-text-strong">{{ name }}</span>
      <span
        class="whitespace-nowrap font-mono text-overline text-text-muted tnum"
        >{{ sizeLabel }}</span
      >
      <div class="flex-1" />
      <button
        type="button"
        class="frame-btn"
        :aria-label="t('boards.frame.prev', { name })"
        :disabled="first"
        data-action="prev"
        @click="emit('prev')"
      >
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="frame-btn"
        :aria-label="t('boards.frame.next', { name })"
        :disabled="last"
        data-action="next"
        @click="emit('next')"
      >
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="frame-btn"
        :aria-label="t('boards.frame.resize', { name, width: widget.width })"
        :disabled="fixed"
        data-action="resize"
        @click="emit('resize')"
      >
        <MoveHorizontal class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="frame-btn hover:!bg-danger-surface hover:!text-danger-text"
        :aria-label="t('boards.frame.remove', { name })"
        data-action="remove"
        @click="emit('remove')"
      >
        <X class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.widget {
  transition:
    opacity 0.15s,
    box-shadow 0.15s,
    outline-color 0.15s;
}

.widget-editing {
  outline: 1px dashed rgb(var(--c-border-strong));
  outline-offset: 8px;
}

.widget-editing:hover {
  outline-color: rgb(var(--c-text-faint));
}

.frame-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: rgb(var(--c-text-muted));
  transition:
    background 0.12s,
    color 0.12s;
}

.frame-btn:hover:not(:disabled) {
  background: rgb(var(--c-surface-raised));
  color: rgb(var(--c-text-strong));
}

.frame-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
