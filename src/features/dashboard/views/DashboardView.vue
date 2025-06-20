<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardApi } from "../api";
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
} from "../types";
import DashboardCharts from "../components/DashboardCharts.vue";

const stats = ref<FullDashboardStatsDto | null>(null);
const serverData = ref<ServerCreationStat[]>([]);
const upsData = ref<UPSLoadStat[]>([]);

async function loadDashboard() {
  try {
    stats.value = await dashboardApi.getFullStats();
    serverData.value = await dashboardApi.getServerCreations();
    upsData.value = await dashboardApi.getUPSLoad();
  } catch (error) {
    console.error("Erreur lors du chargement des stats:", error);
  }
}

onMounted(() => {
  loadDashboard();
  setInterval(loadDashboard, 30000);
});
</script>

<template>
  <div class="p-6 grid gap-6">
    <h1 class="text-3xl font-bold">Bienvenue sur le Dashboard</h1>
    <p class="text-gray-600 mb-4">Vue d'ensemble de l'infrastructure IT</p>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="font-semibold text-lg mb-2">Accès rapide</h2>
        <ul class="text-blue-600 space-y-1">
          <li><a href="/servers">Voir les serveurs</a></li>
          <li><a href="/ups">Voir les onduleurs</a></li>
          <li><a href="/alerts">Voir les alertes</a></li>
        </ul>
      </div>

      <div class="bg-white rounded-xl shadow p-4 col-span-2">
        <h2 class="font-semibold text-lg mb-4">Statistiques globales</h2>
        <div v-if="stats" class="grid grid-cols-4 gap-4">
          <div class="stat-card">
            <p>Utilisateurs</p>
            <span>{{ stats.totalUsers }}</span>
          </div>
          <div class="stat-card">
            <p>Admins</p>
            <span>{{ stats.adminUsers }}</span>
          </div>
          <div class="stat-card">
            <p>Salles</p>
            <span>{{ stats.totalRooms }}</span>
          </div>
          <div class="stat-card">
            <p>Onduleurs</p>
            <span>{{ stats.totalUps }}</span>
          </div>
          <div class="stat-card">
            <p>Serveurs</p>
            <span>{{ stats.totalServers }}</span>
          </div>
          <div class="stat-card">
            <p>VMs</p>
            <span>{{ stats.totalVms }}</span>
          </div>
          <div class="stat-card">
            <p>Connectés</p>
            <span>{{ stats.onlineUsers }}</span>
          </div>
          <div class="stat-card">
            <p>Setup</p>
            <div class="w-full bg-neutral-200 rounded-full h-2.5">
              <div
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: stats.setupProgress + '%' }"
              ></div>
            </div>
            <small>{{ stats.setupProgress }}%</small>
          </div>
        </div>
        <div v-else class="flex justify-center items-center h-24 text-gray-400">
          Chargement des statistiques...
        </div>
      </div>
    </div>

    <div v-if="stats">
      <DashboardCharts
        :stats="stats"
        :server-data="serverData"
        :ups-data="upsData"
      />
      <div
        v-if="!stats.serversUp && !stats.serversDown"
        class="text-red-500 font-bold"
      >
        Erreur : Aucun serveur détecté
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply bg-neutral-50 rounded-lg shadow p-4 flex flex-col items-center justify-center;
}
.stat-card p {
  @apply text-sm text-gray-500 mb-1;
}
.stat-card span {
  @apply text-xl font-semibold text-blue-600;
}
</style>
