<template>
  <div class="min-h-screen bg-surface-sunken p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text-strong">
              {{ t('migration.title') }}
            </h1>
            <p class="mt-2 text-text">
              {{ t('migration.description') }}
            </p>
          </div>
          <div
            class="flex items-center space-x-2 text-sm text-text-muted"
          >
            <Clock class="w-4 h-4" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <div
          class="bg-surface rounded-lg shadow-sm border border-border p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-text-strong">
              {{ t('migration.flow.title') }}
            </h2>
            <button
              @click="refreshVMs"
              :disabled="isRefreshing"
              class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary disabled:bg-[rgb(var(--c-primary-hover)/0.1)] text-white rounded-lg transition-colors text-sm font-medium"
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
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
            ></div>
            <span class="ml-3 text-text">{{
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
