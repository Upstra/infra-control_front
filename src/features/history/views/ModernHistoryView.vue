<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useHistoryStore } from '../store';
import { useI18n } from 'vue-i18n';
import InfiniteScrollHistory from '../components/InfiniteScrollHistory.vue';
import HistoryEventCard from '../components/HistoryEventCard.vue';
import HistoryEventDetail from '../components/HistoryEventDetail.vue';
import AdvancedHistoryFilters from '../components/AdvancedHistoryFilters.vue';
import HistoryStats from '../components/HistoryStats.vue';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { events, loading, totalItems, currentPage, filters, hasMore } =
  storeToRefs(historyStore);
const { fetchHistory, getAvailableEntityTypes } = historyStore;

const selectedEvent = ref<any>(null);
const showDetail = ref(false);
const showStats = ref(true);
const viewMode = ref<'cards' | 'table'>('cards');
const allEvents = ref<any[]>([]);
const isInitialLoad = ref(true);

const pageSize = 20;

const loadMoreEvents = async () => {
  if (loading.value || !hasMore.value) return;

  const nextPage = currentPage.value + 1;
  await fetchHistory(nextPage, pageSize);

  // Append new events to allEvents
  if (events.value.length > 0) {
    allEvents.value = [...allEvents.value, ...events.value];
  }
};

const showEventDetail = (event: any) => {
  selectedEvent.value = event;
  showDetail.value = true;
};

const closeDetail = () => {
  showDetail.value = false;
  selectedEvent.value = null;
};

const applyFilters = async () => {
  allEvents.value = [];
  isInitialLoad.value = true;
  await fetchHistory(1, pageSize);
  if (events.value.length > 0) {
    allEvents.value = [...events.value];
  }
  isInitialLoad.value = false;
};

const exportData = () => {
  const dataStr = JSON.stringify(allEvents.value, null, 2);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `history-export-${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

onMounted(async () => {
  await Promise.all([fetchHistory(1, pageSize), getAvailableEntityTypes()]);
  if (events.value.length > 0) {
    allEvents.value = [...events.value];
  }
  isInitialLoad.value = false;
});

// Update hasMore computed based on current data
const computedHasMore = computed(() => {
  return allEvents.value.length < totalItems.value;
});
</script>

<template>
  <div class="modern-history-view">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('administration.history_page_title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Track all system activities and user actions
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showStats = !showStats"
          class="icon-button"
          :class="{ active: showStats }"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
          <span>Analytics</span>
        </button>

        <div class="view-toggle">
          <button
            @click="viewMode = 'cards'"
            :class="{ active: viewMode === 'cards' }"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              ></path>
            </svg>
          </button>
          <button
            @click="viewMode = 'table'"
            :class="{ active: viewMode === 'table' }"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
          </button>
        </div>

        <button @click="exportData" class="icon-button">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          <span>Export</span>
        </button>

        <div
          class="text-sm text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-100 dark:bg-neutral-700 rounded-lg"
        >
          <strong>{{ allEvents.length }}</strong> of
          <strong>{{ totalItems }}</strong> events
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <transition name="slide-down">
      <HistoryStats v-if="showStats" :events="allEvents" />
    </transition>

    <!-- Filters -->
    <AdvancedHistoryFilters
      v-model="filters"
      :available-entity-types="[
        'server',
        'vm',
        'user',
        'room',
        'ups',
        'group',
        'auth',
        'user_role',
      ]"
      @apply="applyFilters"
      class="mb-6"
    />

    <!-- Content -->
    <div class="content-section">
      <InfiniteScrollHistory
        v-if="viewMode === 'cards'"
        :events="allEvents"
        :loading="loading && !isInitialLoad"
        :has-more="computedHasMore"
        @load-more="loadMoreEvents"
      >
        <template #default="{ event }">
          <HistoryEventCard :event="event" @show-detail="showEventDetail" />
        </template>
      </InfiniteScrollHistory>

      <!-- Table view would go here if viewMode === 'table' -->
      <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
        Table view coming soon...
      </div>
    </div>

    <!-- Event Detail Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showDetail"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          @click.self="closeDetail"
        >
          <div class="modal-content">
            <button
              @click="closeDetail"
              class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <HistoryEventDetail v-if="selectedEvent" :event="selectedEvent" />
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modern-history-view {
  @apply p-6 space-y-6;
}

.header-section {
  @apply flex items-start justify-between;
}

.icon-button {
  @apply px-4 py-2 flex items-center gap-2 rounded-lg border border-gray-300 dark:border-neutral-600;
  @apply bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all;
}

.icon-button.active {
  @apply bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400;
}

.view-toggle {
  @apply flex bg-gray-100 dark:bg-neutral-700 rounded-lg p-1;
}

.view-toggle button {
  @apply px-3 py-1.5 rounded-md transition-all;
}

.view-toggle button.active {
  @apply bg-white dark:bg-neutral-800 shadow-sm;
}

.content-section {
  @apply bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 min-h-[600px];
}

.modal-content {
  @apply bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative;
  @apply transform transition-all;
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  @apply transition-all duration-300;
}

.slide-down-enter-from {
  @apply opacity-0 -translate-y-4;
}

.slide-down-leave-to {
  @apply opacity-0 -translate-y-4;
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  @apply scale-95;
}
</style>
