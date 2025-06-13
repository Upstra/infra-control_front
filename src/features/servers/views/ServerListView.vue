<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { fetchServers } from "../api";
import type { Server } from "../types";
import ServerCard from "../components/ServerCard.vue";

const servers = ref<Server[]>([]);
const loading = ref(true);
const error = ref("");
const page = ref(1);
const pageSize = 6;
const total = ref(0);

const searchQuery = ref("");
const selectedState = ref<"all" | "active" | "inactive">("all");

const filteredServers = computed(() => {
  return servers.value.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      server.ip.includes(searchQuery.value);

    const matchesState =
      selectedState.value === "all" || server.state === selectedState.value;

    return matchesSearch && matchesState;
  });
});

const paginatedServers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredServers.value.slice(start, start + pageSize);
});

const loadServers = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetchServers();
    servers.value = res.data.length ? res.data : [];
    total.value = servers.value.length;
  } catch (err: any) {
    error.value = "Erreur lors du chargement des serveurs";
  } finally {
    loading.value = false;
  }
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
      <h1 class="text-3xl font-bold text-neutral-darker">Serveurs</h1>

      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par nom ou IP"
          class="flex-1 px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          v-model="selectedState"
          class="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
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
        Précédent
      </button>

      <span class="px-4 py-2 text-sm font-medium text-neutral-dark">
        Page {{ page }} / {{ Math.ceil(filteredServers.length / pageSize) }}
      </span>

      <button
        @click="page++"
        :disabled="page >= Math.ceil(filteredServers.length / pageSize)"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50 transition"
      >
        Suivant
      </button>
    </div>

    <div v-if="loading" class="text-neutral-dark text-center py-10">
      Chargement des serveurs...
    </div>

    <div v-else-if="error" class="text-danger text-center py-10">
      {{ error }}
    </div>

    <div
      v-else-if="!filteredServers.length"
      class="text-neutral-dark text-center py-10"
    >
      Aucun serveur trouvé.
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
        Précédent
      </button>

      <span class="px-4 py-2 text-sm font-medium text-neutral-dark">
        Page {{ page }} / {{ Math.ceil(filteredServers.length / pageSize) }}
      </span>

      <button
        @click="page++"
        :disabled="page >= Math.ceil(filteredServers.length / pageSize)"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50 transition"
      >
        Suivant
      </button>
    </div>
  </div>
</template>
