<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import RoomCard from "../components/RoomCard.vue";
import type { Room } from "../types";

const rooms = ref<Room[]>([]);
const loading = ref(true);
const error = ref("");
const page = ref(1);
const pageSize = 6;

const searchQuery = ref("");

const filteredRooms = computed(() => {
  return rooms.value.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedRooms = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRooms.value.slice(start, start + pageSize);
});

const loadRooms = async () => {
  loading.value = true;
  try {
    rooms.value = getMockRooms();
  } catch (err) {
    error.value = "Erreur de chargement des salles.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadRooms);

watch(searchQuery, () => {
  page.value = 1;
});

const getMockRooms = (): Room[] => [
  {
    id: "room-1",
    name: "Salle Informatique A",
    serverCount: 5,
    upsCount: 2,
  },
  {
    id: "room-2",
    name: "Salle Technique B",
    serverCount: 3,
    upsCount: 1,
  },
  {
    id: "room-3",
    name: "Salle Réserve C",
    serverCount: 7,
    upsCount: 3,
  },
  {
    id: "room-1",
    name: "Salle Informatique A",
    serverCount: 5,
    upsCount: 2,
  },
  {
    id: "room-2",
    name: "Salle Technique B",
    serverCount: 3,
    upsCount: 1,
  },
  {
    id: "room-3",
    name: "Salle Réserve C",
    serverCount: 7,
    upsCount: 3,
  },
  {
    id: "room-1",
    name: "Salle Informatique A",
    serverCount: 5,
    upsCount: 2,
  },
  {
    id: "room-2",
    name: "Salle Technique B",
    serverCount: 3,
    upsCount: 1,
  },
  {
    id: "room-3",
    name: "Salle Réserve C",
    serverCount: 7,
    upsCount: 3,
  },
  {
    id: "room-1",
    name: "Salle Informatique A",
    serverCount: 5,
    upsCount: 2,
  },
  {
    id: "room-2",
    name: "Salle Technique B",
    serverCount: 3,
    upsCount: 1,
  },
  {
    id: "room-3",
    name: "Salle Réserve C",
    serverCount: 7,
    upsCount: 3,
  },
  {
    id: "room-1",
    name: "Salle Informatique A",
    serverCount: 5,
    upsCount: 2,
  },
  {
    id: "room-2",
    name: "Salle Technique B",
    serverCount: 3,
    upsCount: 1,
  },
  {
    id: "room-3",
    name: "Salle Réserve C",
    serverCount: 7,
    upsCount: 3,
  },
];
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
    >
      <h1 class="text-2xl font-bold text-neutral-darker">Liste des salles</h1>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Rechercher une salle"
          class="px-3 py-2 w-full sm:w-64 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition"
        >
          + Ajouter une salle
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-neutral-dark">
      Chargement...
    </div>
    <div v-else-if="error" class="text-center text-danger">
      {{ error }}
    </div>
    <div
      v-else-if="!filteredRooms.length"
      class="text-center text-neutral-dark"
    >
      Aucune salle trouvée.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RoomCard v-for="room in paginatedRooms" :key="room.id" :room="room" />
    </div>

    <div
      v-if="filteredRooms.length > pageSize"
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
        Page {{ page }} / {{ Math.ceil(filteredRooms.length / pageSize) }}
      </span>
      <button
        @click="page++"
        :disabled="page >= Math.ceil(filteredRooms.length / pageSize)"
        class="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-light disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  </div>
</template>
