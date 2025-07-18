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
          <MagnifyingGlassIcon
            class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          />
        </div>

        <select
          v-model="selectedType"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{{ $t('groups.allTypes') }}</option>
          <option value="SERVER">{{ $t('groups.serverGroups') }}</option>
          <option value="VM">{{ $t('groups.vmGroups') }}</option>
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

    <div
      v-if="loading && groups.length === 0"
      class="flex justify-center py-12"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div v-else-if="filteredGroups.length === 0" class="text-center py-12">
      <FolderOpenIcon
        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('groups.noGroups') }}
      </p>
    </div>

    <div v-else class="space-y-6">
      <div v-if="viewMode === 'sections'">
        <div v-for="type in groupTypes" :key="type" class="mb-8">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <component
              :is="getTypeIcon(type)"
              class="w-6 h-6"
              :class="getTypeColorClass(type)"
            />
            {{ getTypeLabel(type) }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <GroupCard
              v-for="group in getGroupsByType(type)"
              :key="group.id"
              :group="group"
              :resources="getGroupResources(group)"
              @details-click="$emit('group-select', group)"
              @menu-click="(event) => $emit('group-menu', { group, event })"
            />
          </div>
        </div>
      </div>

      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
          :resources="getGroupResources(group)"
          @details-click="$emit('group-select', group)"
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
              <component
                :is="getTypeIcon(group.type)"
                class="w-5 h-5"
                :class="getTypeColorClass(group.type)"
              />
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ group.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getResourceCount(group) }} {{ getResourceLabel(group) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
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
import type { Group, GroupType } from '../types';
import GroupCard from './GroupCard.vue';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FolderOpenIcon,
  ServerIcon,
  CpuChipIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline';

interface GroupListProps {
  groups: Group[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  showCreateButton?: boolean;
  showLoadMore?: boolean;
  viewMode?: 'grid' | 'list' | 'sections';
  resourcesMap?: Record<
    string,
    Array<{ id: string; name: string; state: 'active' | 'inactive' }>
  >;
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
  'group-menu': [payload: { group: Group; event: MouseEvent }];
  'load-more': [];
}>();

const searchQuery = ref('');
const selectedType = ref<GroupType | ''>('');

const groupTypes: GroupType[] = ['SERVER', 'VM'];

const filteredGroups = computed(() => {
  let filtered = [...props.groups];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query),
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter((group) => group.type === selectedType.value);
  }

  return filtered;
});

const getGroupsByType = (type: GroupType) => {
  return filteredGroups.value.filter((group) => group.type === type);
};

const getTypeIcon = (type: GroupType) => {
  return type === 'SERVER' ? ServerIcon : CpuChipIcon;
};

const getTypeColorClass = (type: GroupType) => {
  return type === 'SERVER' ? 'text-blue-500' : 'text-purple-500';
};

const getTypeLabel = (type: GroupType) => {
  return type === 'SERVER' ? 'Server Groups' : 'VM Groups';
};

const getResourceCount = (group: Group) => {
  if (group.type === 'SERVER') {
    return group.serverCount ?? 0;
  } else {
    return group.vmCount ?? 0;
  }
};

const getResourceLabel = (group: Group) => {
  if (group.type === 'SERVER') {
    return 'servers';
  }
  return 'VMs';
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
