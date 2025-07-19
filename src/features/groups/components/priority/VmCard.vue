<template>
  <div
    :class="[
      'bg-gray-50 dark:bg-gray-900 rounded-md border transition-all duration-200 p-3',
      isDragging ? 'opacity-50 scale-105 shadow-lg' : '',
      isOver ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600',
    ]"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ vm.name }}
        </h4>
        <div class="flex items-center gap-2 mt-1">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              vm.state === 'running'
                ? 'bg-green-500'
                : vm.state === 'paused'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400',
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
