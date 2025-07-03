<template>
  <div class="group-list">
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1 flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('groups.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        
        <select
          v-model="selectedType"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{{ $t('groups.allTypes') }}</option>
          <option value="server">{{ $t('groups.serverGroups') }}</option>
          <option value="vm">{{ $t('groups.vmGroups') }}</option>
        </select>

        <select
          v-model="selectedPriority"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option :value="null">{{ $t('groups.allPriorities') }}</option>
          <option :value="1">{{ $t('groups.priority1') }}</option>
          <option :value="2">{{ $t('groups.priority2') }}</option>
          <option :value="3">{{ $t('groups.priority3') }}</option>
          <option :value="4">{{ $t('groups.priority4') }}</option>
        </select>
      </div>

      <button
        v-if="showCreateButton"
        @click="$emit('create-click')"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <PlusIcon class="w-5 h-5" />
        {{ $t('groups.createGroup') }}
      </button>
    </div>

    <div v-if="loading && groups.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
      {{ error }}
    </div>

    <div v-else-if="filteredGroups.length === 0" class="text-center py-12">
      <FolderOpenIcon class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ $t('groups.noGroups') }}</p>
    </div>

    <div v-else class="space-y-6">
      <div v-if="viewMode === 'sections'">
        <div v-for="type in groupTypes" :key="type" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <component :is="getTypeIcon(type)" class="w-6 h-6" :class="getTypeColorClass(type)" />
            {{ getTypeLabel(type) }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <GroupCard
              v-for="group in getGroupsByType(type)"
              :key="group.id"
              :group="group"
              :resources="getGroupResources(group)"
              @details-click="$emit('group-select', group)"
              @start-click="$emit('group-start', group)"
              @stop-click="$emit('group-stop', group)"
              @menu-click="(event) => $emit('group-menu', { group, event })"
            />
          </div>
        </div>
      </div>

      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
          :resources="getGroupResources(group)"
          @details-click="$emit('group-select', group)"
          @start-click="$emit('group-start', group)"
          @stop-click="$emit('group-stop', group)"
          @menu-click="(event) => $emit('group-menu', { group, event })"
        />
      </div>

      <div v-else-if="viewMode === 'list'" class="space-y-2">
        <div
          v-for="group in filteredGroups"
          :key="group.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="$emit('group-select', group)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <component :is="getTypeIcon(group.type)" class="w-5 h-5" :class="getTypeColorClass(group.type)" />
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ group.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getResourceCount(group) }} {{ getResourceLabel(group) }}
                  <span v-if="group.cascade" class="ml-2 text-blue-600 dark:text-blue-400">• Cascade</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getPriorityClass(group.priority)"
              >
                P{{ group.priority }}
              </span>
              <ChevronRightIcon class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLoadMore && hasMore" class="mt-6 text-center">
      <button
        @click="$emit('load-more')"
        :disabled="loading"
        class="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {{ loading ? $t('common.loading') : $t('common.loadMore') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Group, GroupType, GroupPriority, GroupServerResponseDto, GroupVmResponseDto } from '../types';
import GroupCard from './GroupCard.vue';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FolderOpenIcon,
  ServerIcon,
  CpuChipIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline';

interface GroupListProps {
  groups: Group[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  showCreateButton?: boolean;
  showLoadMore?: boolean;
  viewMode?: 'grid' | 'list' | 'sections';
  resourcesMap?: Record<string, Array<{ id: string; name: string; state: 'active' | 'inactive' }>>;
}

const props = withDefaults(defineProps<GroupListProps>(), {
  loading: false,
  error: null,
  hasMore: false,
  showCreateButton: true,
  showLoadMore: true,
  viewMode: 'sections',
  resourcesMap: () => ({}),
});

defineEmits<{
  'create-click': [];
  'group-select': [group: Group];
  'group-start': [group: Group];
  'group-stop': [group: Group];
  'group-menu': [payload: { group: Group; event: MouseEvent }];
  'load-more': [];
}>();

const searchQuery = ref('');
const selectedType = ref<GroupType | ''>('');
const selectedPriority = ref<GroupPriority | null>(null);

const groupTypes: GroupType[] = ['server', 'vm'];

const filteredGroups = computed(() => {
  let filtered = [...props.groups];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(group => 
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter(group => group.type === selectedType.value);
  }

  if (selectedPriority.value !== null) {
    filtered = filtered.filter(group => group.priority === selectedPriority.value);
  }

  return filtered.sort((a, b) => a.priority - b.priority);
});

const getGroupsByType = (type: GroupType) => {
  return filteredGroups.value.filter(group => group.type === type);
};

const getTypeIcon = (type: GroupType) => {
  return type === 'server' ? ServerIcon : CpuChipIcon;
};

const getTypeColorClass = (type: GroupType) => {
  return type === 'server' ? 'text-blue-500' : 'text-purple-500';
};

const getTypeLabel = (type: GroupType) => {
  return type === 'server' ? 'Server Groups' : 'VM Groups';
};

const getPriorityClass = (priority: GroupPriority) => {
  if (priority >= 8) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  } else if (priority >= 5) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
};

const getResourceCount = (group: Group) => {
  if (group.type === 'server') {
    const serverGroup = group as GroupServerResponseDto;
    return (serverGroup.serverIds || []).length;
  } else {
    const vmGroup = group as GroupVmResponseDto;
    return (vmGroup.vmIds || []).length;
  }
};

const getResourceLabel = (group: Group) => {
  const count = getResourceCount(group);
  if (group.type === 'server') {
    return count === 1 ? 'server' : 'servers';
  }
  return count === 1 ? 'VM' : 'VMs';
};

const getGroupResources = (group: Group) => {
  return props.resourcesMap[group.id] || [];
};
</script>

<style scoped lang="scss">
.group-list {
  @apply space-y-6;
}
</style>