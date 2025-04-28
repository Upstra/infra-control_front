<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Room } from "../types";
import type { Server } from "../../servers/types";
import type { Ups } from "../../ups/types";
import ServerCard from "../../servers/components/ServerCard.vue";
import UpsCard from "../../ups/components/UpsCard.vue";

const route = useRoute();
const router = useRouter();

const roomId = route.params.id as string;
const room = ref<Room | null>(null);
const servers = ref<Server[]>([]);
const upsList = ref<Ups[]>([]);
const loading = ref(true);

const loadRoomDetail = async () => {
  loading.value = true;
  try {
    room.value = getMockRoom(roomId);
    servers.value = getMockServers(roomId);
    upsList.value = getMockUps(roomId);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadRoomDetail);

const getMockRoom = (id: string): Room => ({
  id,
  name: "Salle Informatique A",
  serverCount: 2,
  upsCount: 1,
});

const getMockServers = (roomId: string): Server[] => [
  {
    id: "1",
    name: "Serveur 1",
    ip: "192.168.1.10",
    state: "active",
    adminUrl: "https://admin1.local",
    login: "admin",
    type: "physical",
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: roomId,
    groupId: "group-1",
    upsId: "ups-1",
    ilo: {
      name: "ILO-1",
      ip: "192.168.1.100",
      login: "admin",
      password: "pass",
    },
  },
  {
    id: "2",
    name: "Serveur 2",
    ip: "192.168.1.11",
    state: "inactive",
    adminUrl: "https://admin2.local",
    login: "admin",
    type: "virtual",
    priority: 2,
    grace_period_on: 5,
    grace_period_off: 5,
    roomId: roomId,
    groupId: "group-2",
    upsId: "ups-2",
    ilo: {
      name: "ILO-2",
      ip: "192.168.1.101",
      login: "admin",
      password: "pass",
    },
  },
];

const getMockUps = (roomId: string): Ups[] => [
  {
    id: "ups-1",
    name: "Onduleur Principal",
    roomId: roomId,
    state: "active",
    batteryLevel: 80,
  },
];
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-10">
    <div>
      <button
        @click="router.back()"
        class="flex items-center text-sm text-primary hover:text-primary-dark font-semibold transition duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-neutral-dark text-lg animate-pulse">Chargement...</p>
    </div>

    <div v-else-if="room" class="space-y-10">
      <div class="space-y-2">
        <h1 class="text-4xl font-extrabold text-neutral-darker">
          {{ room.name }}
        </h1>
        <p class="text-sm text-neutral-dark">ID de la salle : {{ room.id }}</p>
      </div>

      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-neutral-darker">🖥️ Serveurs</h2>
        </div>

        <div
          v-if="servers.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ServerCard
            v-for="server in servers"
            :key="server.id"
            :server="server"
            class="hover:scale-[1.02] transition-transform"
          />
        </div>
        <p v-else class="text-neutral-dark italic">
          Aucun serveur dans cette salle.
        </p>
      </section>

      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-neutral-darker">🔋 Onduleurs</h2>
        </div>

        <div
          v-if="upsList.length"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <UpsCard
            v-for="ups in upsList"
            :key="ups.id"
            :ups="ups"
            class="hover:scale-[1.02] transition-transform"
          />
        </div>
        <p v-else class="text-neutral-dark italic">
          Aucun onduleur dans cette salle.
        </p>
      </section>
    </div>
  </div>
</template>
