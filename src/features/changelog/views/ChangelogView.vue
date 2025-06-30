<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ReleaseList from '../components/ReleaseList.vue';
import { changelogApi } from '../api';
import { getMockChangelog } from '../mock';
import type { Release } from '../types';

const frontend = ref<Release[]>([]);
const backend = ref<Release[]>([]);
const loading = ref(true);
const error = ref('');

const fetchData = async () => {
  try {
    const data = await changelogApi.fetchReleases();
    frontend.value = data.frontend;
    backend.value = data.backend;
  } catch {
    const mock = getMockChangelog();
    frontend.value = mock.frontend;
    backend.value = mock.backend;
    error.value = 'Failed to fetch releases';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
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
    </div>
    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>
