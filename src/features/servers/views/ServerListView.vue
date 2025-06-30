<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { fetchServers } from '../api';
import type { Server } from '../types';
import ServerCard from '../components/ServerCard.vue';
import ServerCreateModal from '../components/ServerCreateModal.vue';

const servers = ref<Server[]>([]);
const loading = ref(true);
const error = ref('');
const page = ref(1);
const pageSize = 6;
const total = ref(0);

const showCreateModal = ref(false);

const searchQuery = ref('');
const selectedState = ref<'all' | 'active' | 'inactive'>('all');
const { t } = useI18n();

const filteredServers = computed(() => {
  return servers.value.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      server.ip.includes(searchQuery.value);

    const matchesState =
      selectedState.value === 'all' || server.state === selectedState.value;

    return matchesSearch && matchesState;
  });
});

const paginatedServers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredServers.value.slice(start, start + pageSize);
});

const loadServers = async () => {
  loading.value = true;
  error.value = '';

  try {
    const res = await fetchServers();
    servers.value = res.data.length ? res.data : [];
    total.value = servers.value.length;
  } catch (err: any) {
    error.value = t('servers.loading_error');
  } finally {
    loading.value = false;
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  loadServers();
};

watch([searchQuery, selectedState], () => {
  page.value = 1;
});

onMounted(loadServers);
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6"
    >
      <h1 class="text-3xl font-bold text-neutral-darker">
        {{ t('servers.list_title') }}
      </h1>

      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('servers.search_placeholder')"
          class="flex-1 px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          v-model="selectedState"
          class="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">{{ t('servers.filter_all') }}</option>
          <option value="active">{{ t('servers.filter_active') }}</option>
          <option value="inactive">{{ t('servers.filter_inactive') }}</option>
        </select>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          {{ t('servers.add_server') }}
        </button>
      </div>
    </div>
    <div
      v-if="filteredServers.length > pageSize"
      class="flex justify-center mt-10 space-x-4"
    >
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50 transition"
      >
        {{ t('servers.previous') }}
      </button>

      <span class="px-4 py-2 text-sm font-medium text-neutral-dark">
        {{ t('servers.page') }} {{ page }} /
        {{ Math.ceil(filteredServers.length / pageSize) }}
      </span>

      <button
        @click="page++"
        :disabled="page >= Math.ceil(filteredServers.length / pageSize)"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50 transition"
      >
        {{ t('servers.next') }}
      </button>
    </div>

    <div v-if="loading" class="text-neutral-dark text-center py-10">
      {{ t('servers.loading') }}
    </div>

    <div v-else-if="error" class="text-danger text-center py-10">
      {{ error }}
    </div>

    <div
      v-else-if="!filteredServers.length"
      class="text-neutral-dark text-center py-10"
    >
      {{ t('servers.no_servers') }}
    </div>

    <div
      v-else
      class="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    >
      <ServerCard
        v-for="server in paginatedServers"
        :key="server.id"
        :server="server"
      />
    </div>
    <div
      v-if="filteredServers.length > pageSize"
      class="flex justify-center mt-10 space-x-4"
    >
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50 transition"
      >
        {{ t('servers.previous') }}
      </button>

      <span class="px-4 py-2 text-sm font-medium text-neutral-dark">
        {{ t('servers.page') }} {{ page }} /
        {{ Math.ceil(filteredServers.length / pageSize) }}
      </span>

      <button
        @click="page++"
        :disabled="page >= Math.ceil(filteredServers.length / pageSize)"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50 transition"
      >
        {{ t('servers.next') }}
      </button>
    </div>
  </div>
  <ServerCreateModal
    :is-open="showCreateModal"
    @close="showCreateModal = false"
    @created="handleCreated"
  />
</template>
