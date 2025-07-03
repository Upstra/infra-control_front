<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full dark:bg-gray-800"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-yellow-900/20"
            >
              <ExclamationTriangleIcon
                class="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3
                class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                id="modal-title"
              >
                {{ $t('groups.shutdownPreview') }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('groups.shutdownWarning') }}
                </p>
              </div>

              <div v-if="groupStore.shutdownPreview" class="mt-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                      <span class="font-medium">{{
                        groupStore.shutdownPreview.totalVms
                      }}</span>
                      VMs,
                      <span class="font-medium">{{
                        groupStore.shutdownPreview.totalServers
                      }}</span>
                      Servers
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                      {{ $t('pagination.showing') }}
                      {{
                        (groupStore.shutdownPreview.currentPage - 1) * 10 + 1
                      }}-{{
                        Math.min(
                          groupStore.shutdownPreview.currentPage * 10,
                          groupStore.shutdownPreview.totalItems,
                        )
                      }}
                      {{ $t('pagination.of') }}
                      {{ groupStore.shutdownPreview.totalItems }}
                    </div>
                  </div>

                  <div v-if="groupStore.shutdownPreview.totalPages > 1">
                    <GroupPagination
                      :current-page="groupStore.shutdownPreview.currentPage"
                      :total-pages="groupStore.shutdownPreview.totalPages"
                      @page-change="onPageChange"
                    />
                  </div>
                </div>

                <div
                  class="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-600"
                >
                  <table
                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-600"
                  >
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          {{ $t('groups.shutdownOrder') }}
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          {{ $t('groups.type') }}
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          {{ $t('groups.name') }}
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          {{ $t('groups.group') }}
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          {{ $t('groups.priority') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600"
                    >
                      <tr
                        v-for="step in groupStore.shutdownPreview.items"
                        :key="step.entityId"
                        class="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                        >
                          <span
                            class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {{ step.order }}
                          </span>
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                        >
                          <div class="flex items-center gap-2">
                            <CpuChipIcon
                              v-if="step.type === 'vm'"
                              class="h-5 w-5 text-blue-600 dark:text-blue-400"
                            />
                            <ServerIcon
                              v-else
                              class="h-5 w-5 text-green-600 dark:text-green-400"
                            />
                            <span class="capitalize">{{ step.type }}</span>
                          </div>
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ step.entityName }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                        >
                          {{ step.groupName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getPriorityClass(step.priority)"
                          >
                            {{ step.priority }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                v-if="groupStore.isLoadingPreview"
                class="mt-6 flex items-center justify-center py-8"
              >
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                ></div>
                <span class="ml-3 text-gray-600 dark:text-gray-300">{{
                  $t('groups.loadingPreview')
                }}</span>
              </div>

              <div
                v-if="groupStore.error"
                class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
              >
                <div class="flex items-center gap-2">
                  <ExclamationTriangleIcon
                    class="h-5 w-5 text-red-600 dark:text-red-400"
                  />
                  <p class="text-red-800 dark:text-red-300">
                    {{ groupStore.error }}
                  </p>
                </div>
              </div>

              <div
                v-if="
                  groupStore.shutdownPreview && !groupStore.isLoadingPreview
                "
                class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800"
              >
                <div class="flex items-start gap-2">
                  <ExclamationTriangleIcon
                    class="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                  />
                  <div class="text-sm text-yellow-800 dark:text-yellow-300">
                    <p class="font-medium">
                      {{ $t('groups.confirmationRequired') }}
                    </p>
                    <p class="mt-1">
                      {{ $t('groups.shutdownConfirmationText') }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="isAdmin && groupStore.shutdownPreview" class="mt-4">
                <label class="flex items-center gap-2">
                  <input
                    v-model="confirmationChecked"
                    type="checkbox"
                    class="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ $t('groups.confirmUnderstandConsequences') }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-gray-700"
        >
          <button
            v-if="isAdmin && groupStore.shutdownPreview"
            @click="executeShutdown"
            :disabled="!confirmationChecked || groupStore.isExecutingShutdown"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div
              v-if="groupStore.isExecutingShutdown"
              class="flex items-center gap-2"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              {{ $t('groups.executing') }}
            </div>
            <span v-else>{{ $t('groups.executeShutdown') }}</span>
          </button>

          <button
            @click="$emit('close')"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  ExclamationTriangleIcon,
  CpuChipIcon,
  ServerIcon,
} from '@heroicons/vue/24/outline';
import { useGroupStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import GroupPagination from './GroupPagination.vue';

const props = defineProps<{
  isOpen: boolean;
  selectedGroupIds: string[];
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const groupStore = useGroupStore();
const authStore = useAuthStore();
const confirmationChecked = ref(false);

const isAdmin = authStore.currentUser?.roles?.some((role) => role.isAdmin);

const getPriorityClass = (priority: number) => {
  if (priority >= 8) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  } else if (priority >= 5) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
};

const onPageChange = async (page: number) => {
  await groupStore.previewShutdown(props.selectedGroupIds, { page });
};

const executeShutdown = async () => {
  try {
    await groupStore.executeShutdown(props.selectedGroupIds);
    emit('success');
    emit('close');
  } catch (error) {
    console.error('Failed to execute shutdown:', error);
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.selectedGroupIds.length > 0) {
      groupStore.previewShutdown(props.selectedGroupIds);
      confirmationChecked.value = false;
    }
  },
);
</script>
