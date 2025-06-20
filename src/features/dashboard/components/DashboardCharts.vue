<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-white rounded-xl shadow p-4">
      <h2 class="font-semibold mb-2">Créations serveurs (6 mois)</h2>
      <canvas ref="serverChart"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow p-4">
      <h2 class="font-semibold mb-2">Charge UPS (24h)</h2>
      <canvas ref="upsChart"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow p-4">
      <h2 class="font-semibold mb-2">Répartition des serveurs</h2>
      <canvas ref="statusChart"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
} from "../types";
import Chart from "chart.js/auto";

const props = defineProps<{
  stats: FullDashboardStatsDto | null;
  serverData: ServerCreationStat[];
  upsData: UPSLoadStat[];
}>();

const serverChart = ref<HTMLCanvasElement>();
const upsChart = ref<HTMLCanvasElement>();
const statusChart = ref<HTMLCanvasElement>();

let serverChartInstance: Chart | null = null;
let upsChartInstance: Chart | null = null;
let statusChartInstance: Chart | null = null;

/**
 * Render all dashboard charts with data provided through component props.
 * Existing chart instances are destroyed before re-creating them to avoid
 * memory leaks.
 */
function renderCharts() {
  if (serverChart.value) {
    if (serverChartInstance) serverChartInstance.destroy();
    serverChartInstance = new Chart(serverChart.value, {
      type: "bar",
      data: {
        labels: props.serverData.map((s) => s.month),
        datasets: [
          {
            label: "Créations",
            data: props.serverData.map((s) => s.count),
            backgroundColor: "#2563EB",
          },
        ],
      },
    });
  }

  if (upsChart.value) {
    if (upsChartInstance) upsChartInstance.destroy();
    upsChartInstance = new Chart(upsChart.value, {
      type: "line",
      data: {
        labels: props.upsData.map((u) => u.hour),
        datasets: [
          {
            label: "Charge UPS (%)",
            data: props.upsData.map((u) => u.load),
            borderColor: "#10B981",
            tension: 0.4,
            fill: false,
          },
        ],
      },
    });
  }

  if (statusChart.value) {
    if (statusChartInstance) statusChartInstance.destroy();
    if (props.stats) {
      statusChartInstance = new Chart(statusChart.value, {
        type: "doughnut",
        data: {
          labels: ["UP", "DOWN"],
          datasets: [
            {
              data: [props.stats.serversUp, props.stats.serversDown],
              backgroundColor: ["#10B981", "#EF4444"],
            },
          ],
        },
      });
    }
  }
}

watch(
  () => [props.stats, props.serverData, props.upsData],
  () => renderCharts(),
  { immediate: true }
);

onBeforeUnmount(() => {
  if (serverChartInstance) serverChartInstance.destroy();
  if (upsChartInstance) upsChartInstance.destroy();
  if (statusChartInstance) statusChartInstance.destroy();
});
</script>
