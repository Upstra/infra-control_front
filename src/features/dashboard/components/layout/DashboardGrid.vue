<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import type { DashboardLayout, WidgetConfig } from '../../types/widget';

const props = defineProps<{
  layout: DashboardLayout;
  editMode?: boolean;
}>();

const emit = defineEmits<{
  updateLayout: [widgets: WidgetConfig[]];
  removeWidget: [widgetId: string];
  editWidget: [widgetId: string];
}>();

const draggableComponent = VueDraggableNext;

const localWidgets = ref<WidgetConfig[]>([...props.layout.widgets]);

watch(() => props.layout.widgets, (newWidgets) => {
  localWidgets.value = [...newWidgets];
}, { deep: true });

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.layout.columns}, 1fr)`,
  gap: '1rem',
  minHeight: '400px',
}));

const getWidgetStyle = (widget: WidgetConfig) => {
  return {
    gridColumn: `span ${widget.position.w}`,
    gridRow: `span ${widget.position.h}`,
    minHeight: `${widget.position.h * props.layout.rowHeight}px`,
  };
};

const onDragEnd = () => {
  emit('updateLayout', localWidgets.value);
};

const handleRemoveWidget = (widgetId: string) => {
  emit('removeWidget', widgetId);
};

const handleEditWidget = (widgetId: string) => {
  emit('editWidget', widgetId);
};
</script>

<template>
  <div class="dashboard-grid-container">
    <draggable-component
      v-model="localWidgets"
      :style="gridStyle"
      :disabled="!editMode"
      @end="onDragEnd"
      class="dashboard-grid"
      :class="{ 'edit-mode': editMode }"
      item-key="id"
    >
      <template #item="{ element: widget }">
        <div
          v-if="widget.visible"
          :key="widget.id"
          :style="getWidgetStyle(widget)"
          class="widget-wrapper"
          :class="{ 'draggable': editMode }"
        >
          <div v-if="editMode" class="widget-controls">
            <button
              @click="handleEditWidget(widget.id)"
              class="control-button edit"
              title="Edit widget"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click="handleRemoveWidget(widget.id)"
              class="control-button remove"
              title="Remove widget"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          <slot :widget="widget" />
        </div>
      </template>
    </draggable-component>
  </div>
</template>

<style scoped>
.dashboard-grid-container {
  @apply w-full;
}

.dashboard-grid {
  @apply transition-all duration-300;
}

.dashboard-grid.edit-mode {
  @apply bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-600;
}

.widget-wrapper {
  @apply relative transition-all duration-200;
}

.widget-wrapper.draggable {
  @apply cursor-move;
}

.widget-wrapper.draggable:hover {
  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900 rounded-xl;
}

.widget-controls {
  @apply absolute -top-2 -right-2 flex gap-1 z-10;
}

.control-button {
  @apply p-1.5 rounded-full shadow-lg transition-all;
}

.control-button.edit {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.control-button.remove {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.sortable-ghost {
  @apply opacity-50;
}

.sortable-drag {
  @apply opacity-0;
}
</style>