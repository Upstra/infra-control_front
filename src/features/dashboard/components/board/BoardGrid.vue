<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import WidgetFrame from './WidgetFrame.vue';
import { WIDGET_COMPONENTS } from '../widgets/registry';
import type { BoardWidget } from '../../domain/layout';

const props = defineProps<{ widgets: BoardWidget[]; editing: boolean }>();

const emit = defineEmits<{
  reorder: [widgets: BoardWidget[]];
  move: [from: number, to: number];
  resize: [id: string];
  remove: [id: string];
}>();

const list = computed({
  get: () => props.widgets,
  set: (widgets: BoardWidget[]) => emit('reorder', widgets),
});
</script>

<template>
  <VueDraggable
    v-model="list"
    :disabled="!editing"
    :animation="180"
    handle=".widget-handle"
    ghost-class="widget-ghost"
    chosen-class="widget-chosen"
    class="board-grid grid grid-cols-12 items-start gap-5"
  >
    <WidgetFrame
      v-for="(widget, index) in widgets"
      :key="widget.id"
      :widget="widget"
      :editing="editing"
      :first="index === 0"
      :last="index === widgets.length - 1"
      @prev="emit('move', index, index - 1)"
      @next="emit('move', index, index + 1)"
      @resize="emit('resize', widget.id)"
      @remove="emit('remove', widget.id)"
    >
      <component :is="WIDGET_COMPONENTS[widget.type]" :editing="editing" />
    </WidgetFrame>
  </VueDraggable>
</template>

<style scoped>
.board-grid {
  grid-auto-flow: row dense;
}

.board-grid :deep(.widget-ghost) {
  outline: 2px solid rgb(var(--c-primary-hover));
  outline-offset: 8px;
  box-shadow: 0 0 0 12px rgb(var(--c-primary-hover) / 0.08);
  opacity: 0.6;
}

@media (max-width: 759px) {
  .board-grid :deep(.widget) {
    grid-column: 1 / -1 !important;
  }
}
</style>
