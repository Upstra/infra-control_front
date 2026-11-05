<template>
  <div
    class="group-card bg-surface rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-border"
    :class="{
      'ring-2 ring-primary': isSelected,
      'opacity-75': isDragging,
    }"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3
          class="text-lg font-semibold text-text-strong flex items-center gap-2"
        >
          <component :is="typeIcon" class="w-5 h-5" :class="typeColorClass" />
          {{ group.name }}
        </h3>
        <p
          v-if="group.description"
          class="text-sm text-text mt-1"
        >
          {{ group.description }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="showActions"
          @click="$emit('menu-click', $event)"
          class="p-1 rounded hover:bg-surface-raised transition-colors"
        >
          <EllipsisVerticalIcon class="w-5 h-5 text-text-muted" />
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-4 text-sm">
        <div class="flex items-center gap-1">
          <component :is="resourceIcon" class="w-4 h-4 text-text-muted" />
          <span class="text-text">
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
                ? 'bg-success-surface text-success-text'
                : 'bg-surface-raised text-text'
            "
          >
            {{ resource.name }}
          </span>
          <span
            v-if="resources.length > maxResourcesDisplay"
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-surface-raised text-text"
          >
            +{{ resources.length - maxResourcesDisplay }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="showActions"
      class="mt-4 pt-4 border-t border-border flex justify-between items-center"
    >
      <button
        @click="$emit('details-click')"
        class="text-sm text-primary-text hover:text-primary-text font-medium"
      >
        {{ $t('groups.viewDetails') }}
      </button>
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
}

const props = withDefaults(defineProps<GroupCardProps>(), {
  resources: () => [],
  isSelected: false,
  isDragging: false,
  showActions: true,
  showResources: true,
  maxResourcesDisplay: 5,
});

defineEmits<{
  'menu-click': [event: MouseEvent];
  'details-click': [];
}>();

const typeIcon = computed(() =>
  props.group.type === 'SERVER' ? ServerIcon : CpuChipIcon,
);
const resourceIcon = computed(() =>
  props.group.type === 'SERVER' ? ServerIcon : CpuChipIcon,
);

const typeColorClass = computed(() =>
  props.group.type === 'SERVER' ? 'text-primary-text' : 'text-purple-500',
);

const resourceCount = computed(() => {
  if (props.group.type === 'SERVER') {
    return props.group.serverCount ?? props.resources?.length ?? 0;
  } else {
    return props.group.vmCount ?? props.resources?.length ?? 0;
  }
});

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
