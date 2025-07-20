<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click="closeDialog"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <div
      class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      @click.stop
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('setup.restart.title') }}
        </h3>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ t('setup.restart.description') }}
        </p>

        <div
          class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
        >
          <div class="flex items-start space-x-3">
            <ExclamationTriangleIcon
              class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-amber-800 dark:text-amber-200">
                {{ t('setup.restart.warning.title') }}
              </p>
              <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {{ t('setup.restart.warning.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="closeDialog"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="confirmRestart"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          {{ t('setup.restart.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';

const { t } = useI18n();
const setupStore = useSetupStore();

interface Props {
  isOpen: boolean;
}

interface Emits {
  (event: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const closeDialog = () => {
  emit('close');
};

const confirmRestart = async () => {
  await setupStore.restartSetup();
  closeDialog();
};
</script>
