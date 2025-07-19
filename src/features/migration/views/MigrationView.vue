<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('migration.title') }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ t('migration.description') }}
            </p>
          </div>
          <div
            class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <Clock class="w-4 h-4" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('migration.flow.title') }}
            </h2>
            <button
              @click="refreshVMs"
              :disabled="isRefreshing"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              :title="t('migration.refresh_vms')"
            >
              <RefreshCw :class="['w-4 h-4', isRefreshing && 'animate-spin']" />
              {{
                isRefreshing
                  ? t('migration.refreshing')
                  : t('migration.refresh_vms')
              }}
            </button>
          </div>

          <div v-if="isRefreshing" class="flex justify-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            ></div>
            <span class="ml-3 text-gray-600 dark:text-gray-400">{{
              t('migration.refreshing')
            }}</span>
          </div>
          <PriorityFlow v-else />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MigrationDestinations />
        <MigrationControl />
      </div>

      <MigrationStatus />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Clock, RefreshCw } from 'lucide-vue-next';
import PriorityFlow from '@/features/groups/components/PriorityFlow.vue';
import MigrationDestinations from '../components/MigrationDestinations.vue';
import MigrationControl from '../components/MigrationControl.vue';
import MigrationStatus from '../components/MigrationStatus.vue';
import { syncVMs } from '@/features/vmware/api';
import { usePriorityStore } from '@/features/groups/stores/usePriorityStore';
import { useToast } from 'vue-toast-notification';

const { t } = useI18n();
const priorityStore = usePriorityStore();
const toast = useToast();

const isRefreshing = ref(false);

const currentDate = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const refreshVMs = async () => {
  isRefreshing.value = true;

  try {
    const result = await syncVMs();

    if (result.success) {
      toast.success(
        result.changes && result.duration
          ? t('migration.sync_success_details', {
              changes: result.changes,
              duration: result.duration,
            })
          : t('migration.sync_success'),
      );

      await priorityStore.fetchAllData();
    } else {
      toast.error(result.message || t('migration.sync_error'));
    }
  } catch (error: any) {
    console.error('Error syncing VMs:', error);
    toast.error(t('migration.sync_error'));
  } finally {
    isRefreshing.value = false;
  }
};
</script>
