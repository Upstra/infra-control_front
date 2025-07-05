<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { DashboardLayout, Widget } from '../../types';

const props = defineProps<{
  layout: DashboardLayout;
  editMode?: boolean;
}>();

const emit = defineEmits<{
  updateLayout: [widgets: Widget[]];
  removeWidget: [widgetId: string];
  editWidget: [widgetId: string];
}>();

const localWidgets = ref<Widget[]>([...props.layout.widgets]);
const draggedWidget = ref<Widget | null>(null);
const isDragging = ref(false);
const previewPosition = ref<{ x: number; y: number } | null>(null);
const canDrop = ref(false);
const gridContainer = ref<HTMLElement | null>(null);

watch(
  () => props.layout.widgets,
  (newWidgets) => {
    localWidgets.value = [...newWidgets];
  },
  { deep: true },
);

const screenSize = ref<'mobile' | 'tablet' | 'desktop'>('desktop');
const adjustedColumns = ref(props.layout.columns);

const updateScreenSize = () => {
  const width = window.innerWidth;
  if (width < 640) {
    screenSize.value = 'mobile';
    adjustedColumns.value = 2;
  } else if (width < 1024) {
    screenSize.value = 'tablet';
    adjustedColumns.value = Math.min(props.layout.columns, 6);
  } else {
    screenSize.value = 'desktop';
    adjustedColumns.value = props.layout.columns;
  }
};

onMounted(() => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${adjustedColumns.value}, 1fr)`,
  gap: screenSize.value === 'mobile' ? '0.5rem' : '1rem',
  minHeight: screenSize.value === 'mobile' ? '300px' : '400px',
  position: 'relative' as const,
}));

const getWidgetStyle = (widget: Widget) => {
  let colSpan = widget.position.w;
  let rowSpan = widget.position.h;
  let startCol = widget.position.x + 1;

  // Adjust widget size for mobile/tablet
  if (screenSize.value === 'mobile') {
    colSpan = 2; // Full width on mobile
    startCol = 1;
  } else if (screenSize.value === 'tablet') {
    // Scale down widgets proportionally
    const ratio = adjustedColumns.value / props.layout.columns;
    colSpan = Math.max(2, Math.round(widget.position.w * ratio));
    startCol = Math.min(
      Math.floor(widget.position.x * ratio) + 1,
      adjustedColumns.value - colSpan + 1,
    );
  }

  const minHeight =
    screenSize.value === 'mobile'
      ? `${rowSpan * 60}px`
      : `${rowSpan * props.layout.rowHeight}px`;

  return {
    gridColumn:
      screenSize.value === 'mobile'
        ? '1 / -1'
        : `${startCol} / span ${colSpan}`,
    gridRow:
      screenSize.value === 'mobile'
        ? 'auto'
        : `${widget.position.y + 1} / span ${rowSpan}`,
    minHeight,
  };
};

const handleRemoveWidget = (widgetId: string) => {
  emit('removeWidget', widgetId);
};

const handleEditWidget = (widgetId: string) => {
  emit('editWidget', widgetId);
};

const getGridPosition = (event: DragEvent): { x: number; y: number } | null => {
  if (!gridContainer.value) return null;

  const rect = gridContainer.value.getBoundingClientRect();
  const padding = 16; // p-4 = 1rem = 16px

  // Calculate relative position
  const relativeX = event.clientX - rect.left - padding;
  const relativeY = event.clientY - rect.top - padding;

  // If outside grid bounds, return null
  if (relativeX < 0 || relativeY < 0) {
    return null;
  }

  // Calculate cell size including gap
  const gap = 16;
  const totalWidth = rect.width - 2 * padding;
  const cellWidth =
    (totalWidth - gap * (props.layout.columns - 1)) / props.layout.columns;
  const cellPlusGap = cellWidth + gap;

  // Calculate grid coordinates
  const gridX = Math.floor(relativeX / cellPlusGap);
  const gridY = Math.floor((relativeY + gap) / (props.layout.rowHeight + gap));

  // Ensure within bounds
  if (gridX < 0 || gridX >= props.layout.columns) {
    return null;
  }

  return { x: gridX, y: Math.max(0, gridY) };
};

const isValidPosition = (
  widget: Widget,
  position: { x: number; y: number },
): boolean => {
  // Disable drag and drop on mobile
  if (screenSize.value === 'mobile') {
    return false;
  }

  // Check if widget fits within grid columns
  if (position.x + widget.position.w > adjustedColumns.value) {
    return false;
  }

  // Check for overlaps with other widgets
  return !localWidgets.value.some((w) => {
    if (w.id === widget.id) return false;

    const xOverlap =
      position.x < w.position.x + w.position.w &&
      position.x + widget.position.w > w.position.x;
    const yOverlap =
      position.y < w.position.y + w.position.h &&
      position.y + widget.position.h > w.position.y;

    return xOverlap && yOverlap;
  });
};

const handleDragStart = (event: DragEvent, widget: Widget) => {
  // Disable drag on mobile
  if (screenSize.value === 'mobile') {
    event.preventDefault();
    return;
  }

  draggedWidget.value = widget;
  isDragging.value = true;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', widget.id);

    const dragImage = new Image();
    dragImage.src =
      'data:image/svg+xml,%3Csvg width="1" height="1" xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  }
};

const handleDragEnd = () => {
  draggedWidget.value = null;
  isDragging.value = false;
  previewPosition.value = null;
  canDrop.value = false;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();

  if (!draggedWidget.value) return;

  const position = getGridPosition(event);
  if (!position) {
    previewPosition.value = null;
    canDrop.value = false;
    return;
  }

  const isValid = isValidPosition(draggedWidget.value, position);

  previewPosition.value = position;
  canDrop.value = isValid;

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = isValid ? 'move' : 'none';
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();

  if (!draggedWidget.value || !previewPosition.value || !canDrop.value) {
    handleDragEnd();
    return;
  }

  const draggedIndex = localWidgets.value.findIndex(
    (w) => w.id === draggedWidget.value?.id,
  );
  if (draggedIndex !== -1) {
    const newWidgets = [...localWidgets.value];
    newWidgets[draggedIndex] = {
      ...newWidgets[draggedIndex],
      position: {
        ...newWidgets[draggedIndex].position,
        x: previewPosition.value.x,
        y: previewPosition.value.y,
      },
    };

    localWidgets.value = newWidgets;
    emit('updateLayout', newWidgets);
  }

  handleDragEnd();
};

const handleDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!gridContainer.value?.contains(relatedTarget)) {
    previewPosition.value = null;
    canDrop.value = false;
  }
};

const maxRows = computed(() => {
  const maxFromWidgets = Math.max(
    ...localWidgets.value.map((w) => w.position.y + w.position.h),
    0,
  );
  return Math.max(maxFromWidgets + 2, 8);
});

const gridCells = computed(() => {
  const cells = [];
  for (let y = 0; y < maxRows.value; y++) {
    for (let x = 0; x < props.layout.columns; x++) {
      cells.push({ x, y, id: `${x}-${y}` });
    }
  }
  return cells;
});

const previewStyle = computed(() => {
  if (!previewPosition.value || !draggedWidget.value) return null;

  return {
    gridColumn: `${previewPosition.value.x + 1} / span ${draggedWidget.value.position.w}`,
    gridRow: `${previewPosition.value.y + 1} / span ${draggedWidget.value.position.h}`,
    minHeight: `${draggedWidget.value.position.h * props.layout.rowHeight}px`,
  };
});
</script>

<template>
  <div class="dashboard-grid-container">
    <div v-if="!editMode" :style="gridStyle" class="dashboard-grid">
      <div
        v-for="widget in localWidgets"
        v-show="widget.visible !== false"
        :key="widget.id"
        :style="getWidgetStyle(widget)"
        class="widget-wrapper"
      >
        <slot :widget="widget" />
      </div>
    </div>

    <div
      v-else
      ref="gridContainer"
      :style="gridStyle"
      class="dashboard-grid edit-mode"
      :class="{ dragging: isDragging }"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @dragleave="handleDragLeave"
    >
      <div
        v-for="cell in gridCells"
        :key="cell.id"
        class="grid-cell-bg"
        :style="{
          gridColumn: cell.x + 1,
          gridRow: cell.y + 1,
        }"
      />

      <div
        v-if="previewPosition && draggedWidget"
        :style="previewStyle"
        class="widget-preview"
        :class="{
          'preview-valid': canDrop,
          'preview-invalid': !canDrop,
        }"
      >
        <div class="preview-content">
          <div class="preview-icon">
            <svg
              v-if="canDrop"
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <svg
              v-else
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <p class="preview-text">
            {{ canDrop ? 'Drop here' : 'Cannot place here' }}
          </p>
        </div>
      </div>

      <div
        v-for="widget in localWidgets"
        v-show="widget.visible !== false"
        :key="widget.id"
        :style="getWidgetStyle(widget)"
        class="widget-wrapper draggable"
        :class="{
          'is-dragging': draggedWidget?.id === widget.id,
          'drag-disabled': isDragging && draggedWidget?.id !== widget.id,
          'mobile-edit': screenSize === 'mobile',
        }"
        :draggable="screenSize !== 'mobile'"
        @dragstart="handleDragStart($event, widget)"
        @dragend="handleDragEnd"
      >
        <div class="widget-controls">
          <button
            @click="handleEditWidget(widget.id)"
            class="control-button edit"
            title="Edit widget"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
          </button>
          <button
            @click="handleRemoveWidget(widget.id)"
            class="control-button remove"
            title="Remove widget"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>
        <div class="drag-handle">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            ></path>
          </svg>
        </div>
        <slot :widget="widget" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid-container {
  @apply w-full;
}

.dashboard-grid {
  @apply transition-all duration-300;
}

@media (max-width: 640px) {
  .dashboard-grid {
    @apply gap-2;
  }

  .widget-wrapper {
    @apply mb-2;
  }
}

.dashboard-grid.edit-mode {
  @apply bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-600;
  min-height: 600px;
}

@media (max-width: 640px) {
  .dashboard-grid.edit-mode {
    @apply p-2;
    min-height: 400px;
  }
}

.grid-cell-bg {
  @apply border border-gray-200 dark:border-neutral-800 rounded-lg;
  background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: center;
}

.widget-wrapper {
  @apply relative transition-all duration-200 z-10;
}

.widget-wrapper.draggable {
  @apply cursor-move;
}

.widget-wrapper.draggable:hover {
  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900 rounded-xl;
}

.widget-wrapper.is-dragging {
  @apply opacity-30 scale-95;
}

.widget-wrapper.drag-disabled {
  @apply opacity-50;
}

.dashboard-grid.edit-mode.dragging {
  cursor: grabbing !important;
}

.dashboard-grid.edit-mode.dragging * {
  cursor: grabbing !important;
}

.widget-controls {
  @apply absolute -top-2 -right-2 flex gap-1 z-20;
}

@media (max-width: 640px) {
  .widget-controls {
    @apply -top-1 -right-1 scale-90;
  }
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

.drag-handle {
  @apply absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-600 dark:bg-gray-400 text-white rounded-full p-2 opacity-50 hover:opacity-100 transition-opacity cursor-move z-20;
}

@media (max-width: 640px) {
  .drag-handle {
    @apply scale-75 top-1;
  }
}

@media (pointer: coarse) {
  .drag-handle {
    @apply opacity-100;
  }
}

.mobile-edit {
  @apply cursor-default;
}

.mobile-edit:hover {
  @apply ring-0;
}

@media (max-width: 640px) {
  .widget-wrapper.draggable {
    @apply cursor-default;
  }

  .widget-wrapper.draggable:hover {
    @apply ring-0;
  }

  .drag-handle {
    @apply hidden;
  }

  .grid-cell-bg {
    @apply hidden;
  }

  .dashboard-grid.edit-mode {
    @apply border-0 bg-transparent dark:bg-transparent;
  }
}

.widget-preview {
  @apply relative rounded-xl border-2 transition-all duration-200 z-30;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.preview-valid {
  @apply border-green-500;
  background-color: rgba(34, 197, 94, 0.2);
}

.preview-invalid {
  @apply border-red-500;
  background-color: rgba(239, 68, 68, 0.2);
}

.preview-content {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.preview-icon {
  @apply mb-2;
}

.preview-valid .preview-icon {
  @apply text-green-600 dark:text-green-400;
}

.preview-invalid .preview-icon {
  @apply text-red-600 dark:text-red-400;
}

.preview-text {
  @apply text-sm font-medium;
}

.preview-valid .preview-text {
  @apply text-green-700 dark:text-green-300;
}

.preview-invalid .preview-text {
  @apply text-red-700 dark:text-red-300;
}
</style>
