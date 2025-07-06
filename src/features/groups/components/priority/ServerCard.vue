<template>
  <div
    :class="[
      'relative bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 transition-all duration-200',
      isDragging ? 'opacity-50 scale-105' : '',
      isOver ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700',
    ]"
    :data-server-id="server.id"
  >
    <div class="p-4">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ server.name }}
          </h3>
          <p
            v-if="server.ipAddress"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            {{ server.ipAddress }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded-md',
              getPriorityColor(server.priority),
            ]"
          >
            P{{ server.priority }} - {{ getPriorityLabel(server.priority) }}
          </span>
          <slot name="drag-handle" />
        </div>
      </div>

      <div
        class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
      >
        <div class="flex items-center gap-1">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              server.state === 'active'
                ? 'bg-green-500'
                : server.state === 'maintenance'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400',
            ]"
          />
          <span>{{ server.state || 'unknown' }}</span>
        </div>
        <div v-if="vmCount > 0" class="flex items-center gap-1">
          <CpuChipIcon class="w-4 h-4" />
          <span>{{ vmCount }} {{ vmCount === 1 ? 'VM' : 'VMs' }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="$slots.default"
      class="border-t border-gray-200 dark:border-gray-700 p-4"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServerWithPriority } from '../../types/priority';
import { getPriorityColor, getPriorityLabel } from '../../utils/priority-utils';
import { CpuChipIcon } from '@heroicons/vue/24/outline';

interface ServerCardProps {
  server: ServerWithPriority;
  isDragging?: boolean;
  isOver?: boolean;
  vmCount?: number;
}

withDefaults(defineProps<ServerCardProps>(), {
  isDragging: false,
  isOver: false,
  vmCount: 0,
});
</script>
