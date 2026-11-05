<template>
  <div
    :class="[
      'relative bg-surface rounded-lg shadow-md border-2 transition-all duration-200',
      isDragging ? 'opacity-50 scale-105' : '',
      isOver ? 'border-primary' : 'border-border',
    ]"
    :data-server-id="server.id"
  >
    <div class="p-4">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-text-strong">
            {{ server.name }}
          </h3>
          <p
            v-if="server.ipAddress"
            class="text-sm text-text"
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
        class="flex items-center gap-4 text-sm text-text"
      >
        <div class="flex items-center gap-1">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              server.state === 'active'
                ? 'bg-success'
                : server.state === 'maintenance'
                  ? 'bg-warning'
                  : 'bg-border-strong',
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
      class="border-t border-border p-4"
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
