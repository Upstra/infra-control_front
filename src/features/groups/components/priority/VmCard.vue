<template>
  <div
    :class="[
      'bg-surface-sunken rounded-md border transition-all duration-200 p-3',
      isDragging ? 'opacity-50 scale-105 shadow-lg' : '',
      isOver ? 'border-primary' : 'border-border-control',
    ]"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-text-strong truncate">
          {{ vm.name }}
        </h4>
        <div class="flex items-center gap-2 mt-1">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              vm.state === 'running'
                ? 'bg-success'
                : vm.state === 'paused'
                  ? 'bg-warning'
                  : 'bg-border-strong',
            ]"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 ml-2">
        <span
          :class="[
            'px-2 py-0.5 text-xs font-medium rounded',
            getPriorityColor(vm.priority),
          ]"
        >
          P{{ vm.priority }}
        </span>
        <slot name="drag-handle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VMWithPriority } from '../../types/priority';
import { getPriorityColor } from '../../utils/priority-utils';

interface VmCardProps {
  vm: VMWithPriority;
  isDragging?: boolean;
  isOver?: boolean;
}

withDefaults(defineProps<VmCardProps>(), {
  isDragging: false,
  isOver: false,
});
</script>
