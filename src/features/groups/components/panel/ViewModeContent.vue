<template>
  <div class="flex h-full">
    <div
      class="w-full lg:w-1/2 xl:w-2/5 px-8 py-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
    >
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <div
            :class="[
              'inline-flex items-center justify-center w-16 h-16 rounded-2xl',
              group.type === 'SERVER'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30',
            ]"
          >
            <component
              :is="group.type === 'SERVER' ? ServerIcon : CpuChipIcon"
              class="w-8 h-8"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ $t('groups.form.type') }}
            </p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{
                group.type === 'SERVER'
                  ? $t('groups.serverGroup')
                  : $t('groups.vmGroup')
              }}
            </p>
          </div>
        </div>

        <div
          v-if="group.description"
          class="prose prose-sm dark:prose-invert max-w-none"
        >
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('groups.form.description') }}
          </h4>
          <p class="text-gray-600 dark:text-gray-400">
            {{ group.description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div
            class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-xs font-medium text-green-700 dark:text-green-400"
                >
                  {{ $t('groups.activeResources') }}
                </p>
                <p
                  class="text-2xl font-bold text-green-900 dark:text-green-300 mt-1"
                >
                  {{ activeResourcesCount }}
                </p>
              </div>
              <CheckCircleIcon class="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {{ $t('groups.inactiveResources') }}
                </p>
                <p
                  class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1"
                >
                  {{ inactiveResourcesCount }}
                </p>
              </div>
              <XCircleIcon class="w-8 h-8 text-gray-400 opacity-50" />
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-400">
                {{
                  group.type === 'SERVER'
                    ? $t('groups.totalServers')
                    : $t('groups.totalVms')
                }}
              </p>
              <p
                class="text-4xl font-bold text-blue-900 dark:text-blue-200 mt-2"
              >
                {{ loadingResources ? '...' : resources.length }}
              </p>
            </div>
            <div class="relative">
              <svg class="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  class="text-blue-200 dark:text-blue-800"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="`${(activeResourcesCount / Math.max(resources.length, 1)) * 226} 226`"
                  class="text-blue-600 dark:text-blue-400 transition-all duration-500"
                />
              </svg>
              <span
                class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-900 dark:text-blue-200"
              >
                {{
                  Math.round(
                    (activeResourcesCount / Math.max(resources.length, 1)) *
                      100,
                  )
                }}%
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="$emit('edit')"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md"
          >
            <PencilSquareIcon class="w-5 h-5" />
            {{ $t('groups.editGroup') }}
          </button>

          <button
            @click="confirmDelete"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <TrashIcon class="w-5 h-5" />
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 px-8 py-6 overflow-y-auto">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{
            group.type === 'SERVER'
              ? $t('groups.assignedServers')
              : $t('groups.assignedVms')
          }}
        </h3>
      </div>

      <div
        v-if="loadingResources"
        class="flex items-center justify-center h-64"
      >
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('common.loading') }}
          </p>
        </div>
      </div>

      <div
        v-else-if="resources.length === 0"
        class="flex items-center justify-center h-64"
      >
        <div class="text-center">
          <div
            class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
          >
            <component
              :is="group.type === 'SERVER' ? ServerIcon : CpuChipIcon"
              class="w-12 h-12 text-gray-400 dark:text-gray-600"
            />
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{
              group.type === 'SERVER'
                ? $t('groups.noServersInGroup')
                : $t('groups.noVmsInGroup')
            }}
          </p>
          <button
            @click="$emit('edit')"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            {{ $t('groups.addResources') }}
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        <div
          v-for="resource in resources"
          :key="resource.id"
          class="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h4
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ resource.name }}
              </h4>
              <div class="mt-1 space-y-0.5">
                <div
                  v-if="resource.ip"
                  class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  <GlobeAltIcon class="w-3 h-3" />
                  <span>{{ resource.ip }}</span>
                </div>
                <div
                  v-if="resource.roomName"
                  class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  <BuildingOffice2Icon class="w-3 h-3" />
                  <span>{{ resource.roomName }}</span>
                </div>
              </div>
            </div>
            <div class="ml-3">
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  resource.state === 'active' || resource.state === 'running'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                ]"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full mr-1"
                  :class="[
                    resource.state === 'active' || resource.state === 'running'
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-gray-500',
                  ]"
                />
                {{ resource.state || 'unknown' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ServerIcon,
  CpuChipIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline';
import type { GroupResponseDto } from '../../types';

interface Props {
  group: GroupResponseDto;
  resources: any[];
  loadingResources: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  edit: [];
  delete: [group: GroupResponseDto];
}>();

const { t } = useI18n();

const activeResourcesCount = computed(() => {
  return props.resources.filter(
    (r) => r.state === 'active' || r.state === 'running',
  ).length;
});

const inactiveResourcesCount = computed(() => {
  return props.resources.length - activeResourcesCount.value;
});

const confirmDelete = () => {
  if (confirm(t('groups.deleteConfirmMessage', { name: props.group.name }))) {
    emit('delete', props.group);
  }
};
</script>
