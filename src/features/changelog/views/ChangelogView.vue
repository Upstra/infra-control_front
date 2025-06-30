<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ReleaseList from '../components/ReleaseList.vue';
import { changelogApi } from '../api';
import { getMockChangelog } from '../mock';
import type { Release } from '../types';
import PaginationControls from '@/features/users/components/PaginationControls.vue';

const frontend = ref<Release[]>([]);
const backend = ref<Release[]>([]);
const loading = ref(true);
const error = ref('');
const page = ref(1);
const pageSize = 5;
const totalItems = ref(0);

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await changelogApi.fetchReleases(page.value, pageSize);
    frontend.value = data.frontend.items;
    backend.value = data.backend.items;
    totalItems.value = Math.max(
      data.frontend.totalItems,
      data.backend.totalItems,
    );
  } catch {
    const mock = getMockChangelog();
    frontend.value = mock.frontend.items;
    backend.value = mock.backend.items;
    totalItems.value = Math.max(
      mock.frontend.totalItems,
      mock.backend.totalItems,
    );
    error.value = 'Failed to fetch releases';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
watch(page, fetchData);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">Changelog</h1>
    <div v-if="loading" class="text-center text-neutral-dark">Loading...</div>
    <div v-else class="space-y-8">
      <div>
        <h2 class="text-xl font-semibold mb-2">Frontend</h2>
        <ReleaseList :releases="frontend" />
      </div>
      <div>
        <h2 class="text-xl font-semibold mb-2">Backend</h2>
        <ReleaseList :releases="backend" />
      </div>
      <PaginationControls
        :current-page="page"
        :total-items="totalItems"
        :page-size="pageSize"
        @update:page="(p) => { page.value = p; fetchData(); }"
      />
    </div>
    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>
