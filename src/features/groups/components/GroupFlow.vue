<template>
  <div class="group-flow h-full">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ $t('groups.flowView') }}
      </h2>
      <div class="flex gap-2">
        <button
          @click="() => fitView()"
          class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors flex items-center gap-1"
        >
          <ArrowsPointingInIcon class="w-4 h-4" />
          {{ $t('groups.fitView') }}
        </button>
        <button
          @click="toggleOrientation"
          class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors flex items-center gap-1"
        >
          <ArrowsRightLeftIcon v-if="orientation === 'horizontal'" class="w-4 h-4" />
          <ArrowsUpDownIcon v-else class="w-4 h-4" />
          {{ $t('groups.toggleOrientation') }}
        </button>
      </div>
    </div>

    <div class="flow-container bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" style="height: 600px;">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :fit-view-on-init="true"
        :min-zoom="0.2"
        :max-zoom="2"
        :default-zoom="0.8"
        :nodes-connectable="false"
        :edges-updatable="false"
        :node-drag-threshold="10"
        @node-click="handleNodeClick"
      >
        <Background 
          variant="dots" 
          :gap="20"
          :size="1"
          color="#e5e7eb"
          class="dark:opacity-20"
        />
        <Controls 
          :show-zoom="true"
          :show-fit-view="true"
          :show-interactive="false"
          position="bottom-right"
        />
        <MiniMap 
          position="top-right"
          :node-color="getNodeColor"
          :pannable="true"
          :zoomable="false"
        />

        <template #node-group="{ data }">
          <div 
            class="group-node"
            :class="[
              `priority-${data.priority}`,
              `type-${data.type}`,
              { 'cascade-enabled': data.cascade }
            ]"
          >
            <div class="node-header">
              <component :is="data.type === 'server' ? ServerIcon : CpuChipIcon" class="w-4 h-4" />
              <span class="node-title">{{ data.label }}</span>
              <span class="priority-badge">P{{ data.priority }}</span>
            </div>
            <div class="node-content">
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ data.resourceCount }} {{ data.resourceLabel }}
              </div>
              <div v-if="data.cascade" class="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                <ArrowPathIcon class="w-3 h-3" />
                Cascade
              </div>
            </div>
          </div>
        </template>

        <template #edge-custom="{ sourceX, sourceY, targetX, targetY, id, markerEnd }">
          <path
            :id="id"
            class="vue-flow__edge-path"
            :d="`M ${sourceX},${sourceY} L ${targetX},${targetY}`"
            :marker-end="markerEnd"
            stroke="#9ca3af"
            stroke-width="2"
          />
        </template>
      </VueFlow>
    </div>

    <div class="mt-4 flex flex-wrap gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-red-500"></div>
        <span class="text-gray-600 dark:text-gray-400">{{ $t('groups.priority1') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-orange-500"></div>
        <span class="text-gray-600 dark:text-gray-400">{{ $t('groups.priority2') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-yellow-500"></div>
        <span class="text-gray-600 dark:text-gray-400">{{ $t('groups.priority3') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-green-500"></div>
        <span class="text-gray-600 dark:text-gray-400">{{ $t('groups.priority4') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import type { Node, Edge } from '@vue-flow/core';
import type { Group } from '../types';
import { 
  ServerIcon, 
  CpuChipIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon
} from '@heroicons/vue/24/outline';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

interface GroupFlowProps {
  groups: Group[];
}

const props = defineProps<GroupFlowProps>();

const emit = defineEmits<{
  'group-click': [group: Group];
}>();

const { fitView } = useVueFlow();
const orientation = ref<'horizontal' | 'vertical'>('horizontal');

const nodes = computed<Node[]>(() => {
  const priorityPositions = {
    1: { x: 0, y: 0 },
    2: { x: 300, y: 0 },
    3: { x: 600, y: 0 },
    4: { x: 900, y: 0 },
  };

  const groupsByPriority: Record<number, Group[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  props.groups.forEach(group => {
    groupsByPriority[group.priority].push(group);
  });

  const nodeList: Node[] = [];
  
  Object.entries(groupsByPriority).forEach(([priority, groups]) => {
    const pri = parseInt(priority);
    groups.forEach((group, index) => {
      const basePos = priorityPositions[pri as 1 | 2 | 3 | 4];
      const position = orientation.value === 'horizontal'
        ? { x: basePos.x, y: index * 120 }
        : { x: index * 250, y: basePos.x };

      nodeList.push({
        id: group.id,
        type: 'group',
        position,
        data: {
          label: group.name,
          priority: group.priority,
          type: group.type,
          cascade: group.cascade,
          resourceCount: group.type === 'server' ? group.serverIds.length : group.vmIds.length,
          resourceLabel: group.type === 'server' 
            ? (group.serverIds.length === 1 ? 'server' : 'servers')
            : (group.vmIds.length === 1 ? 'VM' : 'VMs'),
          group,
        },
      });
    });
  });

  return nodeList;
});

const edges = computed<Edge[]>(() => {
  const edgeList: Edge[] = [];
  const sortedGroups = [...props.groups].sort((a, b) => a.priority - b.priority);

  for (let i = 0; i < sortedGroups.length - 1; i++) {
    const currentGroup = sortedGroups[i];
    const nextPriorityGroups = sortedGroups.filter(
      g => g.priority === currentGroup.priority + 1 && g.cascade
    );

    nextPriorityGroups.forEach(nextGroup => {
      edgeList.push({
        id: `${currentGroup.id}-${nextGroup.id}`,
        source: currentGroup.id,
        target: nextGroup.id,
        type: 'custom',
        animated: true,
        style: { stroke: '#9ca3af' },
      });
    });
  }

  return edgeList;
});

const handleNodeClick = (event: any) => {
  const node = event.node;
  if (node?.data?.group) {
    emit('group-click', node.data.group);
  }
};

const toggleOrientation = () => {
  orientation.value = orientation.value === 'horizontal' ? 'vertical' : 'horizontal';
};

const getNodeColor = (node: Node) => {
  const priorityColors = {
    1: '#ef4444',
    2: '#f97316', 
    3: '#eab308',
    4: '#22c55e',
  };
  return priorityColors[node.data.priority as 1 | 2 | 3 | 4] || '#6b7280';
};
</script>

<style lang="scss">
.group-flow {
  .flow-container {
    position: relative;
    width: 100%;
  }

  .group-node {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 p-3 min-w-[200px] cursor-pointer transition-all duration-200;
    
    &:hover {
      @apply shadow-lg transform -translate-y-0.5;
    }

    &.priority-1 {
      @apply border-red-400;
      .priority-badge {
        @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
      }
    }

    &.priority-2 {
      @apply border-orange-400;
      .priority-badge {
        @apply bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200;
      }
    }

    &.priority-3 {
      @apply border-yellow-400;
      .priority-badge {
        @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
      }
    }

    &.priority-4 {
      @apply border-green-400;
      .priority-badge {
        @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
      }
    }

    .node-header {
      @apply flex items-center gap-2 mb-2;

      .node-title {
        @apply flex-1 font-medium text-gray-900 dark:text-white;
      }

      .priority-badge {
        @apply px-2 py-0.5 text-xs font-medium rounded-full;
      }

      svg {
        @apply text-gray-600 dark:text-gray-400;
      }
    }

    .node-content {
      @apply space-y-1;
    }

    &.type-server {
      .node-header svg {
        @apply text-blue-500;
      }
    }

    &.type-vm {
      .node-header svg {
        @apply text-purple-500;
      }
    }
  }

  .vue-flow__minimap {
    @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
  }

  .vue-flow__controls {
    @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg;

    button {
      @apply border-gray-200 dark:border-gray-700;
      
      &:hover {
        @apply bg-gray-100 dark:bg-gray-700;
      }
    }
  }
}
</style>