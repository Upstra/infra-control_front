<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseChart from "@/components/charts/BaseChart.vue";
import StatCard from "@/components/ui/StatCard.vue";

interface Alert {
  id: string;
  message: string;
  level: "info" | "warning" | "critical";
  timestamp: string;
}

const alerts = ref<Alert[]>([]);

const fetchAlerts = async () => {
  alerts.value = getMockAlerts();
};

onMounted(fetchAlerts);

const getMockAlerts = (): Alert[] => [
  {
    id: "1",
    message: "Serveur 3 ne répond plus",
    level: "critical",
    timestamp: "2025-05-28T13:20:00Z",
  },
  {
    id: "2",
    message: "Batterie UPS #2 faible (25%)",
    level: "warning",
    timestamp: "2025-05-28T12:40:00Z",
  },
  {
    id: "3",
    message: "Nouvel utilisateur ajouté",
    level: "info",
    timestamp: "2025-05-28T11:15:00Z",
  },
];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

//const servers = ref(5);
//const ups = ref(3);

const barData = {
  labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
  datasets: [
    {
      label: "Serveurs créés",
      data: [3, 5, 2, 7, 4, 6],
      backgroundColor: "#3B82F6",
    },
  ],
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Créations de serveurs (6 derniers mois)" },
  },
};

const lineData = {
  labels: ["00h", "04h", "08h", "12h", "16h", "20h"],
  datasets: [
    {
      label: "Charge moyenne (%)",
      data: [20, 40, 55, 60, 45, 30],
      borderColor: "#10B981",
      tension: 0.4,
      fill: false,
    },
  ],
};

const lineOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Charge UPS (sur 24h)" },
  },
};

const doughnutData = {
  labels: ["Actifs", "En maintenance", "Hors ligne"],
  datasets: [
    {
      label: "Statut",
      data: [10, 2, 1],
      backgroundColor: ["#3B82F6", "#F59E0B", "#EF4444"],
    },
  ],
};

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "Répartition des serveurs" },
  },
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold text-neutral-darker">
        Bienvenue sur le Dashboard
      </h1>
      <p class="text-neutral-dark text-sm">
        Vue d’ensemble de l’infrastructure IT
      </p>
    </div>

    <div class="grid grid-rows-1 md:grid-rows-1 gap-6">
      <div class="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
        <h2 class="text-xl font-semibold text-neutral-darker">Accès rapide</h2>
        <ul class="space-y-1 text-sm">
          <li>
            <RouterLink to="/servers" class="text-primary hover:underline">Voir les serveurs</RouterLink>
          </li>
          <li>
            <RouterLink to="/ups" class="text-primary hover:underline">Voir les onduleurs</RouterLink>
          </li>
          <li>
            <RouterLink to="/alerts" class="text-primary hover:underline">Voir les alertes</RouterLink>
          </li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 class="text-xl font-semibold text-neutral-darker mb-2">
          Statistiques mensuelles
        </h2>

        <div class="p-6 max-w-7xl mx-auto space-y-10">
          <h1 class="text-3xl font-bold text-neutral-darker">Dashboard</h1>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatCard title="Serveurs" :value="13" icon="server" color="primary" />
            <StatCard title="Onduleurs" :value="6" icon="battery-charging" color="blue" />
            <StatCard title="Alertes" :value="1" icon="alert-triangle" color="red" />
          </div>

          <div class="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-neutral-darker mb-4">
              Timeline des événements récents
            </h2>
            <div class="space-y-4">
              <div v-for="alert in alerts" :key="alert.id" class="flex items-start gap-3">
                <div class="w-3 h-3 mt-1 rounded-full" :class="{
                  'bg-green-500': alert.level === 'info',
                  'bg-yellow-500': alert.level === 'warning',
                  'bg-red-500': alert.level === 'critical',
                }"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium" :class="{
                    'text-green-700': alert.level === 'info',
                    'text-yellow-700': alert.level === 'warning',
                    'text-red-700': alert.level === 'critical',
                  }">
                    {{ alert.message }}
                  </p>
                  <p class="text-xs text-neutral-dark">
                    {{ formatDate(alert.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white border rounded-2xl p-6 shadow-sm">
              <BaseChart type="bar" :data="barData" :options="barOptions" />
            </div>
            <div class="bg-white border rounded-2xl p-6 shadow-sm">
              <BaseChart type="line" :data="lineData" :options="lineOptions" />
            </div>
            <div class="bg-white w-1/2 border rounded-2xl p-6 shadow-sm lg:col-span-2">
              <BaseChart type="doughnut" :data="doughnutData" :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
