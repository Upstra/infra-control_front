<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('groups.groupShutdown') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ $t('groups.groupShutdownDescription') }}
        </p>
      </div>

      <div class="bg-white shadow-sm rounded-lg dark:bg-gray-800">
        <div class="p-6">
          <GroupSelection @preview="showPreview = true" />
        </div>
      </div>

      <ShutdownPreviewDialog
        :is-open="showPreview"
        :selected-group-ids="groupStore.selectedGroupIds"
        @close="showPreview = false"
        @success="onShutdownSuccess"
      />

      <div
        v-if="showSuccessMessage"
        class="fixed bottom-4 right-4 p-4 bg-green-100 border border-green-200 rounded-lg shadow-lg dark:bg-green-900/20 dark:border-green-800"
      >
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
          <p class="text-green-800 dark:text-green-300">
            {{ $t('groups.shutdownExecutedSuccessfully') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';
import { useGroupStore } from '../store';
import GroupSelection from '../components/GroupSelection.vue';
import ShutdownPreviewDialog from '../components/ShutdownPreviewDialog.vue';

const groupStore = useGroupStore();
const showPreview = ref(false);
const showSuccessMessage = ref(false);

const onShutdownSuccess = () => {
  showSuccessMessage.value = true;
  groupStore.clearSelection();
  
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 5000);
};
</script>