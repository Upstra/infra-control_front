<script setup lang="ts">
import { ref, onMounted } from "vue";
import { type Ups, UpsState } from "../types";
import UpsCard from "../components/UpsCard.vue";

const upsList = ref<Ups[]>([]);

const loadUps = async () => {
  try {
    upsList.value = getMockUps();
  } catch (error) {
    console.error(error);
  }
};

onMounted(loadUps);

const getMockUps = (): Ups[] => [
  {
    id: "ups-1",
    name: "Onduleur Principal",
    ip: "192.168.0.50",
    grace_period_on: 10,
    grace_period_off: 15,
    roomId: "room-1",
    state: UpsState.Active
  },
  {
    id: "ups-2",
    name: "Onduleur Secondaire",
    ip: "192.168.0.51",
    grace_period_on: 5,
    grace_period_off: 10,
    roomId: "room-2",
    state: UpsState.Inactive
  },
];
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">Liste des onduleurs</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <UpsCard v-for="ups in upsList" :key="ups.id" :ups="ups" />
    </div>
  </div>
</template>
