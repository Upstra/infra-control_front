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
    servers.value = res.data.length ? res.data : getMockServers();
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

const getMockServers = (): Server[] => [
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "inactive",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "inactive",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "inactive",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "inactive",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "inactive",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "inactive",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "1",
    name: "Serveur Principal",
    ip: "192.168.0.1",
    state: "active",
    adminUrl: "https://admin.local",
    login: "root",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: "room-1",
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO One",
      ip: "192.168.0.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur Backup",
    ip: "192.168.0.2",
    state: "active",
    adminUrl: "https://admin.backup",
    login: "backup",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: "room-2",
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO Two",
      ip: "192.168.0.101",
      login: "admin",
      password: "pass",
    },
  },
];
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
    >
      <h1 class="text-2xl font-bold text-neutral-darker">Liste des serveurs</h1>

      <div class="flex flex-col justify-end w-full sm:flex-row gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Rechercher par nom ou IP"
          class="px-3 py-2 w-1/4 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          v-model="selectedState"
          class="px-3 py-2 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-neutral-dark text-center">
      Chargement...
    </div>
    <div v-else-if="error" class="text-danger text-center">{{ error }}</div>
    <div
      v-else-if="!filteredServers.length"
      class="text-neutral-dark text-center"
    >
      Aucun serveur trouvé.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ServerCard
        v-for="server in paginatedServers"
        :key="server.id"
        :server="server"
      />
    </div>

    <div
      v-if="filteredServers.length > pageSize"
      class="flex justify-center mt-6 space-x-2"
    >
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50"
      >
        Précédent
      </button>
      <span class="px-3 py-2 text-sm font-medium text-neutral-dark">
        Page {{ page }} / {{ Math.ceil(filteredServers.length / pageSize) }}
      </span>
      <button
        @click="page++"
        :disabled="page >= Math.ceil(filteredServers.length / pageSize)"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  </div>
</template>
