<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { dashboardApi } from "../api";
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
} from "../types";
import Chart from "chart.js/auto";

const stats = ref<FullDashboardStatsDto | null>(null);
const serverData = ref<ServerCreationStat[]>([]);
const upsData = ref<UPSLoadStat[]>([]);

async function loadDashboard() {
  try {
    stats.value = await dashboardApi.getFullStats();
    serverData.value = await dashboardApi.getServerCreations();
    upsData.value = await dashboardApi.getUPSLoad();
    await nextTick();
    renderCharts();
  } catch (error) {
    console.error("Erreur lors du chargement des stats:", error);
  }
}

function renderCharts() {
  const serverCanvas = document.getElementById(
    "serverChart"
  ) as HTMLCanvasElement;
  const upsCanvas = document.getElementById("upsChart") as HTMLCanvasElement;
  const statusCanvas = document.getElementById(
    "statusChart"
  ) as HTMLCanvasElement;

  if (serverCanvas) {
    new Chart(serverCanvas, {
      type: "bar",
      data: {
        labels: serverData.value.map((s) => s.month),
        datasets: [
          {
            label: "Créations",
            data: serverData.value.map((s) => s.count),
            backgroundColor: "#2563EB",
          },
        ],
      },
    });
  }

  if (upsCanvas) {
    new Chart(upsCanvas, {
      type: "line",
      data: {
        labels: upsData.value.map((u) => u.hour),
        datasets: [
          {
            label: "Charge UPS (%)",
            data: upsData.value.map((u) => u.load),
            borderColor: "#10B981",
            tension: 0.4,
            fill: false,
          },
        ],
      },
    });
  }

  if (statusCanvas && stats.value) {
    new Chart(statusCanvas, {
      type: "doughnut",
      data: {
        labels: ["UP", "DOWN"],
        datasets: [
          {
            data: [stats.value.serversUp, stats.value.serversDown],
            backgroundColor: ["#10B981", "#EF4444"],
          },
        ],
      },
    });
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

    <div v-if="stats" class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="font-semibold mb-2">Créations serveurs (6 mois)</h2>
        <canvas id="serverChart"></canvas>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="font-semibold mb-2">Charge UPS (24h)</h2>
        <canvas id="upsChart"></canvas>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <h2 class="font-semibold mb-2">Répartition des serveurs</h2>
        <canvas id="statusChart"></canvas>
        <div
          v-if="!stats.serversUp && !stats.serversDown"
          class="text-red-500 font-bold"
        >
          Erreur : Aucun serveur détecté
        </div>
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
