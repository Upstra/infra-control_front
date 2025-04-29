<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import type { Server } from "../types";
import { fetchServers } from "../api";

const route = useRoute();
const server = ref<Server | null>(null);
const loading = ref(true);
const error = ref("");
const showEdit = ref(false);
const liveStatus = ref<"up" | "down" | null>(null);
const timeline = ref([
  { time: "Aujourd’hui 08:45", message: "🟢 Serveur démarré" },
  { time: "Hier 22:00", message: "🔴 Extinction planifiée" },
  { time: "Hier 07:23", message: "⚠️ Tentative d’accès iLO refusée" },
]);

onMounted(async () => {
  loading.value = true;
  const id = route.params.id as string;

  try {
    const res = await fetchServers();
    const found = res.data.find((s: Server) => s.id === id);
    server.value =
      found ?? (getMockServers().find((s) => s.id === id) as Server);

    if (!server.value) error.value = "Serveur introuvable";
  } catch (err: any) {
    error.value = "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
});

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
];

const handleStart = () => alert("🟢 Démarrage en cours...");
const handleShutdown = () => alert("🔴 Extinction en cours...");
const handleReboot = () => alert("♻️ Redémarrage en cours...");
const handlePing = () => {
  liveStatus.value = Math.random() > 0.5 ? "up" : "down";
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <nav class="text-sm text-neutral-dark">
      <span class="text-neutral-dark/60">Infrastructure /</span>
      <router-link to="/servers" class="text-primary hover:underline"
        >Serveurs</router-link
      >
      <span class="mx-1">/</span>
      <span class="font-medium text-neutral-darker">{{
        server?.name ?? "..."
      }}</span>
    </nav>

    <div v-if="loading" class="text-center text-neutral-dark">
      Chargement...
    </div>
    <div v-else-if="error" class="text-center text-danger">{{ error }}</div>

    <div v-else-if="server" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-3xl font-bold text-neutral-darker">
          {{ server.name }}
        </h1>

        <div class="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button
            @click="handleStart"
            class="bg-success text-white px-4 py-2 rounded-xl hover:brightness-110"
          >
            Démarrer
          </button>
          <button
            @click="handleShutdown"
            class="bg-danger text-white px-4 py-2 rounded-xl hover:brightness-110"
          >
            Éteindre
          </button>
          <button
            @click="handleReboot"
            class="bg-primary text-white px-4 py-2 rounded-xl hover:brightness-110"
          >
            Redémarrer
          </button>
          <button
            @click="handlePing"
            class="bg-neutral-dark text-white px-4 py-2 rounded-xl"
          >
            Ping
          </button>
          <button
            @click="showEdit = true"
            class="border border-neutral-dark px-4 py-2 rounded-xl"
          >
            Modifier
          </button>
        </div>
      </div>

      <div v-if="liveStatus" class="text-sm">
        Ping :
        <span :class="liveStatus === 'up' ? 'text-success' : 'text-danger'">
          {{ liveStatus === "up" ? "🟢 En ligne" : "🔴 Hors ligne" }}
        </span>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-neutral-dark"
      >
        <div class="space-y-2">
          <p><strong>État :</strong> {{ server.state }}</p>
          <p><strong>IP :</strong> {{ server.ip }}</p>
          <p><strong>Type :</strong> {{ server.type }}</p>
          <p><strong>Priorité :</strong> {{ server.priority }}</p>
          <p>
            <strong>Admin URL :</strong>
            <a
              :href="server.adminUrl"
              class="text-primary underline"
              target="_blank"
              >{{ server.adminUrl }}</a
            >
          </p>
        </div>
        <div class="space-y-2">
          <p>
            <strong>Salle :</strong>
            <router-link
              :to="`/rooms/${server.roomId}`"
              class="text-primary underline"
              >{{ server.roomId }}</router-link
            >
          </p>
          <p>
            <strong>Groupe :</strong>
            <router-link
              :to="`/groups/${server.groupId}`"
              class="text-primary underline"
              >{{ server.groupId }}</router-link
            >
          </p>
          <p>
            <strong>Onduleur :</strong>
            <router-link
              :to="`/ups/${server.upsId}`"
              class="text-primary underline"
              >{{ server.upsId }}</router-link
            >
          </p>
          <p>
            <strong>Temps de grâce ON :</strong> {{ server.grace_period_on }}s
          </p>
          <p>
            <strong>Temps de grâce OFF :</strong> {{ server.grace_period_off }}s
          </p>
        </div>
      </div>

      <div class="bg-neutral-light rounded-xl p-4 mt-4 text-sm">
        <h2 class="text-lg font-semibold text-neutral-darker mb-2">
          🎛️ Interface iLO
        </h2>
        <p><strong>Nom :</strong> {{ server.ilo.name }}</p>
        <p><strong>IP :</strong> {{ server.ilo.ip }}</p>
        <p><strong>Login :</strong> {{ server.ilo.login }}</p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow mt-6">
        <h2 class="text-lg font-semibold text-neutral-darker mb-4">
          📜 Historique
        </h2>
        <ul class="border-l-2 border-neutral-light pl-4 space-y-3">
          <li v-for="(item, i) in timeline" :key="i" class="relative">
            <div
              class="absolute w-3 h-3 bg-primary rounded-full -left-1.5 top-1"
            />
            <p class="text-sm text-neutral-dark px-4">
              <strong>{{ item.time }}</strong> – {{ item.message }}
            </p>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-if="showEdit"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-lg shadow space-y-4 relative"
      >
        <button
          class="absolute top-2 right-2 text-xl text-neutral-dark"
          @click="showEdit = false"
        >
          &times;
        </button>
        <h2 class="text-xl font-bold text-neutral-darker">
          ✏️ Modifier le serveur
        </h2>

        <form v-if="server" class="space-y-3">
          <input
            v-model="server.name"
            type="text"
            class="w-full p-2 rounded border"
            placeholder="Nom"
          />
          <input
            v-model="server.ip"
            type="text"
            class="w-full p-2 rounded border"
            placeholder="Adresse IP"
          />
          <input
            v-model="server.adminUrl"
            type="text"
            class="w-full p-2 rounded border"
            placeholder="Admin URL"
          />
          <select v-model="server.type" class="w-full p-2 rounded border">
            <option value="physical">Physique</option>
            <option value="virtual">Virtuel</option>
          </select>
          <input
            v-model="server.priority"
            type="number"
            class="w-full p-2 rounded border"
            placeholder="Priorité"
          />

          <div class="flex justify-end pt-2">
            <button
              type="button"
              class="bg-primary text-white px-4 py-2 rounded-xl"
              @click="showEdit = false"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
