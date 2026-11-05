<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-text-strong">
        {{ $t('groups.selectGroups') }}
      </h3>
      <div class="flex gap-2">
        <button
          @click="selectAll"
          class="px-3 py-1 text-sm bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text rounded-md hover:bg-[rgb(var(--c-primary-hover)/0.1)]"
        >
          {{ $t('groups.selectAll') }}
        </button>
        <button
          @click="clearAll"
          class="px-3 py-1 text-sm bg-surface-sunken text-text rounded-md hover:bg-surface-raised"
        >
          {{ $t('groups.clearAll') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4
            class="font-medium text-text-strong flex items-center gap-2"
          >
            <ServerIcon class="h-5 w-5" />
            {{ $t('groups.serverGroups') }}
          </h4>
          <span class="text-sm text-text-muted">
            {{ groupStore.serverGroups.length }}
            {{ $t('groups.total') }}
          </span>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="group in groupStore.serverGroups"
            :key="group.id"
            @click="toggleSelection(group.id)"
            class="p-3 border rounded-lg cursor-pointer transition-colors"
            :class="[
              isSelected(group.id)
                ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)]'
                : 'border-border hover:border-border-control',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="isSelected(group.id)"
                  @change="toggleSelection(group.id)"
                  class="rounded border-border-control text-primary-text focus:ring-primary"
                  @click.stop
                />
                <div>
                  <div class="font-medium text-text-strong">
                    {{ group.name }}
                  </div>
                  <div class="text-sm text-text-muted">
                    {{ $t('groups.servers') }}
                    <span v-if="group.description">
                      • {{ group.description }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2"></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h4
            class="font-medium text-text-strong flex items-center gap-2"
          >
            <CpuChipIcon class="h-5 w-5" />
            {{ $t('groups.vmGroups') }}
          </h4>
          <span class="text-sm text-text-muted">
            {{ groupStore.vmGroups.length }} {{ $t('groups.total') }}
          </span>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="group in groupStore.vmGroups"
            :key="group.id"
            @click="toggleSelection(group.id)"
            class="p-3 border rounded-lg cursor-pointer transition-colors"
            :class="[
              isSelected(group.id)
                ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)]'
                : 'border-border hover:border-border-control',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="isSelected(group.id)"
                  @change="toggleSelection(group.id)"
                  class="rounded border-border-control text-primary-text focus:ring-primary"
                  @click.stop
                />
                <div>
                  <div class="font-medium text-text-strong">
                    {{ group.name }}
                  </div>
                  <div class="text-sm text-text-muted">
                    {{ $t('groups.vms') }}
                    <span v-if="group.description">
                      • {{ group.description }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="groupStore.selectedGroupIds.length > 0"
      class="mt-6 p-4 bg-[rgb(var(--c-primary-hover)/0.1)] rounded-lg"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="h-5 w-5 text-primary-text" />
          <span class="font-medium text-primary-text">
            {{ groupStore.selectedGroupIds.length }}
            {{ $t('groups.groupsSelected') }}
          </span>
        </div>
        <button
          @click="$emit('preview')"
          :disabled="groupStore.selectedGroupIds.length === 0"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <div
      v-if="groupStore.error"
      class="p-4 bg-danger-surface border border-danger-border rounded-lg"
    >
      <div class="flex items-center gap-2">
        <ExclamationTriangleIcon
          class="h-5 w-5 text-danger-text"
        />
        <p class="text-danger-text">{{ groupStore.error }}</p>
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
import type {} from '../types';

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

onMounted(() => {
  groupStore.fetchAllGroups();
});
</script>
