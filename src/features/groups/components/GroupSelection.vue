<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ $t('groups.selectGroups') }}
      </h3>
      <div class="flex gap-2">
        <button
          @click="selectAll"
          class="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        >
          {{ $t('groups.selectAll') }}
        </button>
        <button
          @click="clearAll"
          class="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {{ $t('groups.clearAll') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4
            class="font-medium text-gray-900 dark:text-white flex items-center gap-2"
          >
            <ServerIcon class="h-5 w-5" />
            {{ $t('groups.serverGroups') }}
          </h4>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ groupStore.serverGroups?.totalItems || 0 }}
            {{ $t('groups.total') }}
          </span>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="group in groupStore.serverGroups?.items || []"
            :key="group.id"
            @click="toggleSelection(group.id)"
            class="p-3 border rounded-lg cursor-pointer transition-colors"
            :class="[
              isSelected(group.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="isSelected(group.id)"
                  @change="toggleSelection(group.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @click.stop
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ group.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ group.serverIds.length }} {{ $t('groups.servers') }}
                    <span v-if="group.description">
                      • {{ group.description }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getPriorityClass(group.priority)"
                >
                  {{ $t('groups.priority') }} {{ group.priority }}
                </span>
                <span
                  v-if="group.cascade"
                  class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400"
                >
                  {{ $t('groups.cascade') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="
            groupStore.serverGroups && groupStore.serverGroups.totalPages > 1
          "
          class="mt-4"
        >
          <GroupPagination
            :current-page="groupStore.serverGroups.currentPage"
            :total-pages="groupStore.serverGroups.totalPages"
            @page-change="(page) => loadServerGroups({ page })"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h4
            class="font-medium text-gray-900 dark:text-white flex items-center gap-2"
          >
            <CpuChipIcon class="h-5 w-5" />
            {{ $t('groups.vmGroups') }}
          </h4>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ groupStore.vmGroups?.totalItems || 0 }} {{ $t('groups.total') }}
          </span>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="group in groupStore.vmGroups?.items || []"
            :key="group.id"
            @click="toggleSelection(group.id)"
            class="p-3 border rounded-lg cursor-pointer transition-colors"
            :class="[
              isSelected(group.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="isSelected(group.id)"
                  @change="toggleSelection(group.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @click.stop
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ group.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ group.vmIds.length }} {{ $t('groups.vms') }}
                    <span v-if="group.description">
                      • {{ group.description }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getPriorityClass(group.priority)"
                >
                  {{ $t('groups.priority') }} {{ group.priority }}
                </span>
                <span
                  v-if="group.cascade"
                  class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400"
                >
                  {{ $t('groups.cascade') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="groupStore.vmGroups && groupStore.vmGroups.totalPages > 1"
          class="mt-4"
        >
          <GroupPagination
            :current-page="groupStore.vmGroups.currentPage"
            :total-pages="groupStore.vmGroups.totalPages"
            @page-change="(page) => loadVmGroups({ page })"
          />
        </div>
      </div>
    </div>

    <div
      v-if="groupStore.selectedGroupIds.length > 0"
      class="mt-6 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span class="font-medium text-blue-900 dark:text-blue-300">
            {{ groupStore.selectedGroupIds.length }}
            {{ $t('groups.groupsSelected') }}
          </span>
        </div>
        <button
          @click="$emit('preview')"
          :disabled="groupStore.selectedGroupIds.length === 0"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('groups.previewShutdown') }}
        </button>
      </div>
    </div>

    <div
      v-if="groupStore.loading"
      class="flex items-center justify-center py-8"
    >
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div
      v-if="groupStore.error"
      class="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
    >
      <div class="flex items-center gap-2">
        <ExclamationTriangleIcon
          class="h-5 w-5 text-red-600 dark:text-red-400"
        />
        <p class="text-red-800 dark:text-red-300">{{ groupStore.error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  ServerIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';
import { useGroupStore } from '../store';
import type { ServerGroupListParams, VmGroupListParams } from '../types';
import GroupPagination from './GroupPagination.vue';

defineEmits<{
  preview: [];
}>();

const groupStore = useGroupStore();

const isSelected = (groupId: string) => {
  return groupStore.selectedGroupIds.includes(groupId);
};

const toggleSelection = (groupId: string) => {
  groupStore.toggleGroupSelection(groupId);
};

const selectAll = () => {
  groupStore.selectAllGroups();
};

const clearAll = () => {
  groupStore.clearSelection();
};

const loadServerGroups = async (params: ServerGroupListParams = {}) => {
  await groupStore.fetchServerGroups(params);
};

const loadVmGroups = async (params: VmGroupListParams = {}) => {
  await groupStore.fetchVmGroups(params);
};

const getPriorityClass = (priority: number) => {
  if (priority >= 8) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  } else if (priority >= 5) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
};

onMounted(() => {
  groupStore.loadAllGroups();
});
</script>
