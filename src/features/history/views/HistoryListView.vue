<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '../store'
import PaginationControls from '@/features/users/components/PaginationControls.vue'
import { useI18n } from 'vue-i18n'
import { HistoryEntity, HistoryAction } from '../types'

const { t } = useI18n()
const historyStore = useHistoryStore()
const { events, loading, totalItems, currentPage, filters } =
  storeToRefs(historyStore)
const { fetchHistory, setFilters } = historyStore
const pageSize = 10
const entities = Object.values(HistoryEntity)
const actions = Object.values(HistoryAction)

onMounted(() => fetchHistory())

const applyFilters = () => {
  fetchHistory(1, pageSize)
}

const formatDate = (d: string) => new Date(d).toLocaleString()
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-neutral-darker">{{ t('administration.history_page_title') }}</h2>

    <div class="bg-white p-4 rounded-xl shadow space-y-4">
      <div class="flex flex-wrap gap-3 items-end">
        <select class="border rounded px-2 py-1" v-model="filters.entity"
          :aria-label="t('administration.history_details.filters.entity')">
          <option value="">{{ t('common.all') }}</option>
          <option v-for="e in entities" :key="e" :value="e">{{ e }}</option>
        </select>
        <input class="border rounded px-2 py-1" v-model="filters.userId"
          :placeholder="t('administration.history_details.filters.user')" />
        <select class="border rounded px-2 py-1" v-model="filters.action"
          :aria-label="t('administration.history_details.filters.action')">
          <option value="">{{ t('common.all') }}</option>
          <option v-for="a in actions" :key="a" :value="a">{{ a }}</option>
        </select>
        <input type="date" class="border rounded px-2 py-1" v-model="filters.from"
          :aria-label="t('administration.history_details.filters.from')" />
        <input type="date" class="border rounded px-2 py-1" v-model="filters.to"
          :aria-label="t('administration.history_details.filters.to')" />
        <button class="px-4 py-1 bg-primary text-white rounded" @click="applyFilters">
          {{ t('administration.history_details.filters.apply') }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-neutral-darker">
          <thead class="bg-neutral-light uppercase text-xs">
            <tr>
              <th class="p-3 text-left">{{ t('administration.history_details.headers.date') }}</th>
              <th class="p-3 text-left">{{ t('administration.history_details.headers.user') }}</th>
              <th class="p-3 text-left">{{ t('administration.history_details.headers.action') }}</th>
              <th class="p-3 text-left">{{ t('administration.history_details.headers.entity') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in events" :key="ev.id" class="border-t border-neutral-200">
              <td class="p-3">{{ formatDate(ev.createdAt) }}</td>
              <td class="p-3">{{ ev.userId || '-' }}</td>
              <td class="p-3">{{ ev.action }}</td>
              <td class="p-3">{{ ev.entity }} ({{ ev.entityId }})</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="text-center py-4">{{ t('administration.history_details.loading') }}</div>
        <div v-else-if="!events.length" class="text-center py-4 text-neutral-dark">{{
          t('administration.history_details.empty')
        }}</div>
      </div>

      <PaginationControls :current-page="currentPage" :total-items="totalItems" :page-size="pageSize"
        @update:page="p => fetchHistory(p, pageSize)" />
    </div>
  </div>
</template>
