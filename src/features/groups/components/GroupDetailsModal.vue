<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close')"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <component :is="typeIcon" class="w-6 h-6" :class="typeColorClass" />
              {{ group.name }}
            </h2>
            <p v-if="group.description" class="text-gray-600 dark:text-gray-400 mt-1">
              {{ group.description }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('groups.type') }}</h3>
              <p class="text-lg text-gray-900 dark:text-white capitalize">{{ group.type }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('groups.priority') }}</h3>
              <div class="flex items-center gap-2">
                <span 
                  class="px-2 py-1 text-sm font-medium rounded-full"
                  :class="priorityClass"
                >
                  P{{ group.priority }}
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t(`groups.priorityDesc${group.priority}`) }}
                </span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('groups.cascade') }}</h3>
              <div class="flex items-center gap-2">
                <span v-if="group.cascade" class="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <CheckIcon class="w-4 h-4" />
                  {{ $t('groups.cascadeEnabled') }}
                </span>
                <span v-else class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <XMarkIcon class="w-4 h-4" />
                  {{ $t('groups.cascadeDisabled') }}
                </span>
              </div>
            </div>
            <div v-if="group.roomId">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('groups.room') }}</h3>
              <p class="text-lg text-gray-900 dark:text-white">{{ roomName }}</p>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {{ $t('groups.resources') }} ({{ resources.length }})
            </h3>
            <div v-if="resources.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="resource in resources"
                :key="resource.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <component :is="resourceIcon" class="w-5 h-5 text-gray-500" />
                  <span class="font-medium text-gray-900 dark:text-white">{{ resource.name }}</span>
                </div>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="resource.state === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                >
                  {{ resource.state }}
                </span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ $t('groups.noResources') }}
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <div class="flex gap-2">
              <button
                @click="$emit('start', group)"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <PlayIcon class="w-4 h-4" />
                {{ $t('groups.startAll') }}
              </button>
              <button
                @click="$emit('stop', group)"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <StopIcon class="w-4 h-4" />
                {{ $t('groups.stopAll') }}
              </button>
            </div>
            <div class="flex gap-2">
              <button
                @click="$emit('edit', group)"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {{ $t('common.edit') }}
              </button>
              <button
                @click="handleDelete"
                class="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Group } from '../types';
import { useRoomStore } from '@/features/rooms/store';
import { 
  ServerIcon, 
  CpuChipIcon, 
  XMarkIcon,
  CheckIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/vue/24/outline';

interface GroupDetailsModalProps {
  group: Group;
  resources: Array<{ id: string; name: string; state: 'active' | 'inactive' }>;
}

const props = defineProps<GroupDetailsModalProps>();

const emit = defineEmits<{
  close: [];
  edit: [group: Group];
  delete: [group: Group];
  start: [group: Group];
  stop: [group: Group];
}>();

const roomStore = useRoomStore();

const typeIcon = computed(() => props.group.type === 'server' ? ServerIcon : CpuChipIcon);
const resourceIcon = computed(() => props.group.type === 'server' ? ServerIcon : CpuChipIcon);

const typeColorClass = computed(() => 
  props.group.type === 'server' ? 'text-blue-500' : 'text-purple-500'
);

const priorityClass = computed(() => {
  const classes = {
    1: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    4: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return classes[props.group.priority];
});

const roomName = computed(() => {
  if (!props.group.roomId) return '';
  const room = roomStore.list.find(r => r.id === props.group.roomId);
  return room?.name || props.group.roomId;
});

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this group?')) {
    emit('delete', props.group);
  }
};
</script>