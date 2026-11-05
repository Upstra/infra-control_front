<template>
  <div class="flex h-full">
    <div
      class="w-full lg:w-1/2 xl:w-2/5 px-8 py-6 border-r border-border overflow-y-auto"
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
            <p class="text-sm font-medium text-text-muted">
              {{ $t('groups.form.type') }}
            </p>
            <p class="text-lg font-semibold text-text-strong">
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
          <h4 class="text-sm font-medium text-text mb-2">
            {{ $t('groups.form.description') }}
          </h4>
          <p class="text-text">
            {{ group.description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div
            class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-success-border"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-xs font-medium text-success-text"
                >
                  {{ $t('groups.activeResources') }}
                </p>
                <p
                  class="text-2xl font-bold text-success-text mt-1"
                >
                  {{ activeResourcesCount }}
                </p>
              </div>
              <CheckCircleIcon class="w-8 h-8 text-success-text opacity-50" />
            </div>
          </div>

          <div
            class="bg-page rounded-xl p-4 border border-border"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-text">
                  {{ $t('groups.inactiveResources') }}
                </p>
                <p
                  class="text-2xl font-bold text-text-strong mt-1"
                >
                  {{ inactiveResourcesCount }}
                </p>
              </div>
              <XCircleIcon class="w-8 h-8 text-text-muted opacity-50" />
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-primary-dark"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-primary-text">
                {{
                  group.type === 'SERVER'
                    ? $t('groups.totalServers')
                    : $t('groups.totalVms')
                }}
              </p>
              <p
                class="text-4xl font-bold text-primary-text mt-2"
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
                  class="text-primary-text"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="`${(activeResourcesCount / Math.max(resources.length, 1)) * 226} 226`"
                  class="text-primary-text transition-all duration-500"
                />
              </svg>
              <span
                class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary-text"
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
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-border-control rounded-xl text-text hover:bg-surface-sunken transition-all hover:shadow-md"
          >
            <PencilSquareIcon class="w-5 h-5" />
            {{ $t('groups.editGroup') }}
          </button>

          <button
            @click="confirmDelete"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-danger-border rounded-xl text-danger-text hover:bg-danger-surface transition-all"
          >
            <TrashIcon class="w-5 h-5" />
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 px-8 py-6 overflow-y-auto">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-text-strong">
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
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
          ></div>
          <p class="text-sm text-text-muted">
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
            class="mx-auto w-24 h-24 bg-surface-raised rounded-full flex items-center justify-center mb-4"
          >
            <component
              :is="group.type === 'SERVER' ? ServerIcon : CpuChipIcon"
              class="w-12 h-12 text-text-muted"
            />
          </div>
          <p class="text-text mb-4">
            {{
              group.type === 'SERVER'
                ? $t('groups.noServersInGroup')
                : $t('groups.noVmsInGroup')
            }}
          </p>
          <button
            @click="$emit('edit')"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg transition-colors"
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
          class="group relative bg-surface rounded-lg border border-border hover:border-border-control transition-all hover:shadow-md p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h4
                class="text-sm font-medium text-text-strong truncate"
              >
                {{ resource.name }}
              </h4>
              <div class="mt-1 space-y-0.5">
                <div
                  v-if="resource.ip"
                  class="flex items-center gap-1.5 text-xs text-text-muted"
                >
                  <GlobeAltIcon class="w-3 h-3" />
                  <span>{{ resource.ip }}</span>
                </div>
                <div
                  v-if="resource.roomName"
                  class="flex items-center gap-1.5 text-xs text-text-muted"
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
                    ? 'bg-success-surface text-success-text'
                    : 'bg-surface-raised text-text-strong',
                ]"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full mr-1"
                  :class="[
                    resource.state === 'active' || resource.state === 'running'
                      ? 'bg-success animate-pulse'
                      : 'bg-surface',
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
