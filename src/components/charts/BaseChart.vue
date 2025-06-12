<script setup lang="ts">
import { defineProps, watch } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
} from "chart.js";
import { Chart } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement
);

defineProps<{
  type: "bar" | "line" | "doughnut";
  data: any;
  options: any;
}>();
</script>

<template>
  <Chart :type="type" :data="data" :options="options" />
</template>
