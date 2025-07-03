<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useHistoryStore } from '../store';
import PaginationControls from '@/features/users/components/PaginationControls.vue';
import { useI18n } from 'vue-i18n';
import { HistoryEntity, HistoryAction } from '../types';
import { RouterLink } from 'vue-router';
import { entityToPath } from '../types';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { events, loading, totalItems, currentPage, filters } =
  storeToRefs(historyStore);
const { fetchHistory, resetFilters } = historyStore;
const pageSize = 10;
const entities = Object.values(HistoryEntity);
const actions = Object.values(HistoryAction);

const dateError = ref('');

onMounted(() => fetchHistory());

watch(
  filters,
  () => {
    dateError.value = '';
    if (
      filters.value.from &&
      filters.value.to &&
      filters.value.to < filters.value.from
    ) {
      dateError.value = t('errors.invalid_date_range');
      return;
    }
    fetchHistory(1, pageSize);
  },
  { deep: true },
);

const applyFilters = () => {
  dateError.value = '';
  if (
    filters.value.from &&
    filters.value.to &&
    filters.value.to < filters.value.from
  ) {
    dateError.value = t('errors.invalid_date_range');
    return;
  }
  fetchHistory(1, pageSize);
};

const formatDate = (d: string) => new Date(d).toLocaleString();
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-neutral-darker dark:text-white">
      {{ t('administration.history_page_title') }}
    </h2>
    <div class="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow space-y-4">
      <div class="flex flex-wrap gap-3 items-end">
        <select
          class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          v-model="filters.entity"
          :aria-label="t('administration.history_details.filters.entity')"
        >
          <option value="">{{ t('common.all') }}</option>

          <option v-for="e in entities" :key="e" :value="e">{{ e }}</option>
        </select>
        <input
          class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          v-model="filters.userId"
          :placeholder="t('administration.history_details.filters.user')"
        />
        <select
          class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          v-model="filters.action"
          :aria-label="t('administration.history_details.filters.action')"
        >
          <option value="">{{ t('common.all') }}</option>
          <option v-for="a in actions" :key="a" :value="a">{{ a }}</option>
        </select>
        <input
          type="date"
          class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          v-model="filters.from"
          :aria-label="t('administration.history_details.filters.from')"
        />
        <input
          type="date"
          class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          v-model="filters.to"
          :aria-label="t('administration.history_details.filters.to')"
        />
        <button
          class="px-4 py-1 bg-primary dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          @click="applyFilters"
        >
          {{ t('administration.history_details.filters.apply') }}
        </button>
        <button
          class="px-4 py-1 bg-neutral-light dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-neutral-600"
          @click="resetFilters"
        >
          {{ t('common.reset') }}
        </button>
        <div v-if="dateError" class="text-red-500 dark:text-red-400 text-sm">{{ dateError }}</div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-neutral-darker dark:text-gray-300">
          <thead class="bg-neutral-light dark:bg-neutral-700 uppercase text-xs">
            <tr>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.date') }}
              </th>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.user') }}
              </th>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.action') }}
              </th>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.entity') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ev in events"
              :key="ev.id"
              class="border-t border-neutral-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700"
            >
              <td class="p-3">{{ formatDate(ev.createdAt) }}</td>
              <td class="p-3">{{ ev.userId || '-' }}</td>
              <td class="p-3">{{ ev.action }}</td>
              <td class="p-3">
                <RouterLink
                  :to="`/${entityToPath[ev.entity]}/${ev.entityId}`"
                  class="text-primary dark:text-blue-400 hover:underline font-medium"
                  v-if="entityToPath[ev.entity] && ev.entityId"
                >
                  {{ ev.entity }} ({{ ev.entityId }})
                </RouterLink>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="text-center py-4 text-gray-600 dark:text-gray-400">
          {{ t('administration.history_details.loading') }}
        </div>
        <div
          v-else-if="!events.length"
          class="text-center py-4 text-neutral-dark dark:text-neutral-400"
        >
          {{ t('administration.history_details.empty') }}
        </div>
      </div>

      <PaginationControls
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @update:page="(p) => fetchHistory(p, pageSize)"
      />
    </div>
  </div>
</template>
