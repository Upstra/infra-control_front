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
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('migration.flow.title') }}
          </h2>

          <PriorityFlow />
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
import { useI18n } from 'vue-i18n';
import { Clock } from 'lucide-vue-next';
import PriorityFlow from '@/features/groups/components/PriorityFlow.vue';
import MigrationDestinations from '../components/MigrationDestinations.vue';
import MigrationControl from '../components/MigrationControl.vue';
import MigrationStatus from '../components/MigrationStatus.vue';

const { t } = useI18n();

const currentDate = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
</script>
