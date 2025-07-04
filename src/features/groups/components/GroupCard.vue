<template>
  <div
    class="group-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700"
    :class="{
      'ring-2 ring-blue-500': isSelected,
      'opacity-75': isDragging,
    }"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <component :is="typeIcon" class="w-5 h-5" :class="typeColorClass" />
          {{ group.name }}
        </h3>
        <p
          v-if="group.description"
          class="text-sm text-gray-600 dark:text-gray-400 mt-1"
        >
          {{ group.description }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="showActions"
          @click="$emit('menu-click', $event)"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <EllipsisVerticalIcon class="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-4 text-sm">
        <div class="flex items-center gap-1">
          <component :is="resourceIcon" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-600 dark:text-gray-400">
            {{ resourceCount }} {{ resourceLabel }}
          </span>
        </div>
      </div>

      <div v-if="showResources && resources.length > 0" class="mt-3">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="resource in displayedResources"
            :key="resource.id"
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
            :class="
              resource.state === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            "
          >
            {{ resource.name }}
          </span>
          <span
            v-if="resources.length > maxResourcesDisplay"
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            +{{ resources.length - maxResourcesDisplay }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="showActions"
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"
    >
      <button
        @click="$emit('details-click')"
        class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
      >
        {{ $t('groups.viewDetails') }}
      </button>
      <div class="flex gap-2">
        <button
          @click="$emit('start-click')"
          class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          :disabled="isStarting"
        >
          {{ $t('groups.start') }}
        </button>
        <button
          @click="$emit('stop-click')"
          class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          :disabled="isStopping"
        >
          {{ $t('groups.stop') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Group } from '../types';
import {
  ServerIcon,
  CpuChipIcon,
  EllipsisVerticalIcon,
} from '@heroicons/vue/24/outline';

interface GroupCardProps {
  group: Group;
  resources?: Array<{ id: string; name: string; state: 'active' | 'inactive' }>;
  isSelected?: boolean;
  isDragging?: boolean;
  showActions?: boolean;
  showResources?: boolean;
  maxResourcesDisplay?: number;
  isStarting?: boolean;
  isStopping?: boolean;
}

const props = withDefaults(defineProps<GroupCardProps>(), {
  resources: () => [],
  isSelected: false,
  isDragging: false,
  showActions: true,
  showResources: true,
  maxResourcesDisplay: 5,
  isStarting: false,
  isStopping: false,
});

defineEmits<{
  'menu-click': [event: MouseEvent];
  'details-click': [];
  'start-click': [];
  'stop-click': [];
}>();

const typeIcon = computed(() =>
  props.group.type === 'SERVER' ? ServerIcon : CpuChipIcon,
);
const resourceIcon = computed(() =>
  props.group.type === 'SERVER' ? ServerIcon : CpuChipIcon,
);

const typeColorClass = computed(() =>
  props.group.type === 'SERVER' ? 'text-blue-500' : 'text-purple-500',
);

const resourceCount = computed(() => props.resources?.length || 0);

const resourceLabel = computed(() => {
  const count = resourceCount.value;
  if (props.group.type === 'SERVER') {
    return count === 1 ? 'server' : 'servers';
  }
  return count === 1 ? 'VM' : 'VMs';
});

const displayedResources = computed(() =>
  props.resources.slice(0, props.maxResourcesDisplay),
);
</script>

<style scoped lang="scss">
.group-card {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
