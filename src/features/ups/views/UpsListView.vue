<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { type Ups, UpsState } from "../types";
import UpsCard from "../components/UpsCard.vue";
import UpsCreateModal from "../components/UpsCreateModal.vue";

const upsList = ref<Ups[]>([]);
const showCreateModal = ref(false);
const { t } = useI18n();

const loadUps = async () => {
  try {
    upsList.value = getMockUps();
  } catch (error) {
    console.error(error);
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  loadUps();
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
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-2xl font-bold text-neutral-darker">{{ t('ups.list_title') }}</h1>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
      >
        {{ t('ups.add_ups') }}
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <UpsCard v-for="ups in upsList" :key="ups.id" :ups="ups" />
    </div>
    <UpsCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />
  </div>
</template>
