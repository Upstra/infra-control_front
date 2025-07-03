<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ChangelogTabs from '../components/ChangelogTabs.vue';
import ReleaseList from '../components/ReleaseList.vue';
import SkeletonList from '../components/SkeletonList.vue';

import { getMockChangelog } from '../mock';
import type { Release } from '../types';
import { changelogApi } from '../api';

const tab = ref<'frontend' | 'backend'>('frontend');

// Releases accumulent les pages déjà chargées
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
    // Adapte ici si tu reçois { items, totalItems }
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
    // Gestion d’erreur et fallback mock
    const mock = getMockChangelog();
    releases.value[tab.value].push(...mock[tab.value].items);
    totalItems.value[tab.value] = mock[tab.value].totalItems;
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

// Reset l’infinite scroll à chaque changement d’onglet
watch(tab, () => {
  releases.value[tab.value] = [];
  totalItems.value[tab.value] = 0;
  page.value[tab.value] = 1;
  finished.value[tab.value] = false;
  fetchMore();
});

// Premier chargement du composant
onMounted(() => fetchMore());

const currentList = computed(() => releases.value[tab.value]);
const isFinished = computed(() => finished.value[tab.value]);
</script>

<template>
  <div class="mx-auto max-w-3xl py-10 px-2 sm:px-0 space-y-6">
    <h1 class="text-3xl font-extrabold text-neutral-darker dark:text-white mb-2">Changelog</h1>
    <ChangelogTabs v-model:tab="tab" />

    <div class="relative h-[520px]">
      <div
        v-if="loading && !currentList.length"
        class="absolute inset-0 flex flex-col gap-3"
      >
        <SkeletonList :count="pageSize" />
      </div>
      <div v-else class="flex flex-col h-full">
        <div
          ref="scrollContainer"
          class="overflow-y-auto grow pr-2 custom-scroll rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-inner"
          @scroll="onScroll"
        >
          <ReleaseList :releases="currentList" />
          <div v-if="loading && currentList.length" class="py-2 text-center text-slate-600 dark:text-slate-400">
            Chargement…
          </div>
          <div
            v-if="isFinished && currentList.length"
            class="py-2 text-neutral-400 dark:text-neutral-500 text-center"
          >
            Fin du changelog
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-danger text-center">{{ error }}</div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #374151;
  }
}
</style>
