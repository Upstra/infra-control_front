<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ChangelogTabs from '../components/ChangelogTabs.vue';
import ReleaseList from '../components/ReleaseList.vue';
import SkeletonList from '../components/SkeletonList.vue';
import TeamSection from '../components/TeamSection.vue';

import type { Release } from '../types';
import { changelogApi } from '../api';

const tab = ref<'frontend' | 'backend'>('frontend');

const releases = ref<{ frontend: Release[]; backend: Release[] }>({
  frontend: [],
  backend: [],
});
const totalItems = ref<{ frontend: number; backend: number }>({
  frontend: 0,
  backend: 0,
});
const page = ref<{ frontend: number; backend: number }>({
  frontend: 1,
  backend: 1,
});
const pageSize = 5;

const loading = ref(false);
const finished = ref<{ frontend: boolean; backend: boolean }>({
  frontend: false,
  backend: false,
});
const error = ref('');

const scrollContainer = ref<HTMLElement | null>(null);

const fetchMore = async () => {
  if (loading.value || finished.value[tab.value]) return;
  loading.value = true;
  try {
    const data = await changelogApi.fetchReleases(
      page.value[tab.value],
      pageSize,
    );
    const items = data[tab.value].items;
    releases.value[tab.value].push(...items);
    totalItems.value[tab.value] = data[tab.value].totalItems;
    if (
      releases.value[tab.value].length >= data[tab.value].totalItems ||
      items.length === 0
    ) {
      finished.value[tab.value] = true;
    } else {
      page.value[tab.value]++;
    }
  } catch {
    error.value = 'Failed to fetch releases';
    finished.value[tab.value] = true;
  } finally {
    loading.value = false;
  }
};

const onScroll = () => {
  const el = scrollContainer.value;
  if (!el) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    fetchMore();
  }
};

watch(tab, () => {
  releases.value[tab.value] = [];
  totalItems.value[tab.value] = 0;
  page.value[tab.value] = 1;
  finished.value[tab.value] = false;
  fetchMore();
});

onMounted(() => fetchMore());

const currentList = computed(() => releases.value[tab.value]);
const isFinished = computed(() => finished.value[tab.value]);
</script>

<template>
  <div class="mx-auto max-w-5xl py-10 px-2 sm:px-0 space-y-8">
    <div class="text-center space-y-4 mb-12">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 mb-4"
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        <span>{{ $t('changelog.alwaysImproving') }}</span>
      </div>

      <h1
        class="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
      >
        {{ $t('changelog.title') }}
      </h1>

      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {{ $t('changelog.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div
        class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div class="flex items-center justify-between mb-2">
          <svg
            class="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-2xl font-bold text-blue-600 dark:text-blue-400"
            >{{ releases.frontend.length + releases.backend.length }}+</span
          >
        </div>
        <p class="text-gray-700 dark:text-gray-300 font-medium">
          {{ $t('changelog.stats.releases') }}
        </p>
      </div>

      <div
        class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
      >
        <div class="flex items-center justify-between mb-2">
          <svg
            class="w-8 h-8 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span class="text-2xl font-bold text-purple-600 dark:text-purple-400"
            >100+</span
          >
        </div>
        <p class="text-gray-700 dark:text-gray-300 font-medium">
          {{ $t('changelog.stats.features') }}
        </p>
      </div>

      <div
        class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
      >
        <div class="flex items-center justify-between mb-2">
          <svg
            class="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span class="text-2xl font-bold text-green-600 dark:text-green-400"
            >500+</span
          >
        </div>
        <p class="text-gray-700 dark:text-gray-300 font-medium">
          {{ $t('changelog.stats.bugFixes') }}
        </p>
      </div>
    </div>

    <ChangelogTabs v-model:tab="tab" />

    <div class="relative">
      <div
        class="absolute -inset-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-2xl"
      />
      <div
        class="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8"
      >
        <div class="relative h-[600px]">
          <div
            v-if="loading && !currentList.length"
            class="absolute inset-0 flex flex-col gap-3"
          >
            <SkeletonList :count="pageSize" />
          </div>
          <div v-else class="flex flex-col h-full">
            <div
              ref="scrollContainer"
              class="overflow-y-auto grow pr-4 custom-scroll"
              @scroll="onScroll"
            >
              <ReleaseList :releases="currentList" />
              <div
                v-if="loading && currentList.length"
                class="py-4 text-center text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2"
              >
                <svg
                  class="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{ $t('changelog.loading') }}</span>
              </div>
              <div
                v-if="isFinished && currentList.length"
                class="py-4 text-gray-500 dark:text-gray-500 text-center flex items-center justify-center gap-2"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ $t('changelog.endOfList') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
    >
      <svg
        class="w-6 h-6 mx-auto mb-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      {{ error }}
    </div>

    <TeamSection />
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 10px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb, #7c3aed);
  background-clip: padding-box;
}

.dark .custom-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #60a5fa, #a78bfa);
  background-clip: padding-box;
}

.dark .custom-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
  background-clip: padding-box;
}
</style>
