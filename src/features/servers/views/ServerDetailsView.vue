<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import type { Server } from "../types";
import { useServerStore } from "../store";

const route = useRoute();
const serverStore = useServerStore();
const { servers, isLoading, error } = storeToRefs(serverStore);
const server = ref<Server | null>(null);
const viewError = ref("");
const showEdit = ref(false);
const liveStatus = ref<"up" | "down" | null>(null);
const { t } = useI18n();
const timeline = ref([
  { time: t('servers.timeline.today', { time: '08:45' }), message: t('servers.timeline.started') },
  { time: t('servers.timeline.yesterday', { time: '22:00' }), message: t('servers.timeline.shutdown') },
  { time: t('servers.timeline.yesterday', { time: '07:23' }), message: t('servers.timeline.ilo_denied') },
]);

onMounted(async () => {
  const id = route.params.id as string;

  if (!servers.value.length) await serverStore.loadServers();
  const found = servers.value.find((s: Server) => s.id === id);
  server.value = found ?? (getMockServers().find((s) => s.id === id) as Server);

  if (!server.value) viewError.value = "Serveur introuvable";
    if (!server.value) error.value = t('servers.not_found');
  } catch (err: any) {
    error.value = t('servers.loading_error');
  } finally {
    loading.value = false;
  }
});

const getMockServers = (): Server[] => [
  {
    id: "1",
    name: t('servers.default_server'),
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

const handleStart = () => alert(t('servers.starting'));
const handleShutdown = () => alert(t('servers.shutting_down'));
const handleReboot = () => alert(t('servers.rebooting'));
const handlePing = () => {
  liveStatus.value = Math.random() > 0.5 ? "up" : "down";
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <nav class="text-sm text-neutral-dark">
      <span class="text-neutral-dark/60">{{ t('common.infrastructure') }} /</span>
      <router-link to="/servers" class="text-primary hover:underline"
        >{{ t('nav.servers') }}</router-link
      >
      <span class="mx-1">/</span>
      <span class="font-medium text-neutral-darker">{{
        server?.name ?? "..."
      }}</span>
    </nav>

    <div v-if="loading" class="text-center text-neutral-dark">
      {{ t('servers.loading') }}
    </div>
    <div v-else-if="error || viewError" class="text-center text-danger">
      {{ error || viewError }}
    </div>

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
            {{ t('servers.start') }}
          </button>
          <button
            @click="handleShutdown"
            class="bg-danger text-white px-4 py-2 rounded-xl hover:brightness-110"
          >
            {{ t('servers.shutdown') }}
          </button>
          <button
            @click="handleReboot"
            class="bg-primary text-white px-4 py-2 rounded-xl hover:brightness-110"
          >
            {{ t('servers.reboot') }}
          </button>
          <button
            @click="handlePing"
            class="bg-neutral-dark text-white px-4 py-2 rounded-xl"
          >
            {{ t('servers.ping') }}
          </button>
          <button
            @click="showEdit = true"
            class="border border-neutral-dark px-4 py-2 rounded-xl"
          >
            {{ t('servers.edit') }}
          </button>
        </div>
      </div>

      <div v-if="liveStatus" class="text-sm">
        {{ t('servers.ping') }} :
        <span :class="liveStatus === 'up' ? 'text-success' : 'text-danger'">
          {{ liveStatus === 'up' ? t('servers.online') : t('servers.offline') }}
        </span>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-neutral-dark"
      >
        <div class="space-y-2">
          <p><strong>{{ t('servers.state') }} :</strong> {{ server.state }}</p>
          <p><strong>{{ t('servers.ip') }} :</strong> {{ server.ip }}</p>
          <p><strong>{{ t('servers.type') }} :</strong> {{ server.type }}</p>
          <p><strong>{{ t('servers.priority') }} :</strong> {{ server.priority }}</p>
          <p>
            <strong>{{ t('servers.admin_url') }} :</strong>
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
            <strong>{{ t('servers.room') }} :</strong>
            <router-link
              :to="`/rooms/${server.roomId}`"
              class="text-primary underline"
              >{{ server.roomId }}</router-link
            >
          </p>
          <p>
            <strong>{{ t('servers.group') }} :</strong>
            <router-link
              :to="`/groups/${server.groupId}`"
              class="text-primary underline"
              >{{ server.groupId }}</router-link
            >
          </p>
          <p>
            <strong>{{ t('servers.ups') }} :</strong>
            <router-link
              :to="`/ups/${server.upsId}`"
              class="text-primary underline"
              >{{ server.upsId }}</router-link
            >
          </p>
          <p>
            <strong>{{ t('servers.grace_on') }} :</strong> {{ server.grace_period_on }}s
          </p>
          <p>
            <strong>{{ t('servers.grace_off') }} :</strong> {{ server.grace_period_off }}s
          </p>
        </div>
      </div>

      <div class="bg-neutral-light rounded-xl p-4 mt-4 text-sm">
        <h2 class="text-lg font-semibold text-neutral-darker mb-2">
          {{ t('servers.ilo_section') }}
        </h2>
        <p><strong>{{ t('servers.ilo_name') }} :</strong> {{ server.ilo.name }}</p>
        <p><strong>{{ t('servers.ilo_ip') }} :</strong> {{ server.ilo.ip }}</p>
        <p><strong>{{ t('servers.ilo_login') }} :</strong> {{ server.ilo.login }}</p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow mt-6">
        <h2 class="text-lg font-semibold text-neutral-darker mb-4">
          {{ t('servers.history') }}
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
          ✏️ {{ t('servers.edit_title') }}
        </h2>

        <form v-if="server" class="space-y-3">
          <input
            v-model="server.name"
            type="text"
            class="w-full p-2 rounded border"
            :placeholder="t('servers.name')"
          />
          <input
            v-model="server.ip"
            type="text"
            class="w-full p-2 rounded border"
            :placeholder="t('servers.ip')"
          />
          <input
            v-model="server.adminUrl"
            type="text"
            class="w-full p-2 rounded border"
            :placeholder="t('servers.admin_url')"
          />
          <select v-model="server.type" class="w-full p-2 rounded border">
            <option value="physical">{{ t('servers.physical') }}</option>
            <option value="virtual">{{ t('servers.virtual') }}</option>
          </select>
          <input
            v-model="server.priority"
            type="number"
            class="w-full p-2 rounded border"
            :placeholder="t('servers.priority')"
          />

          <div class="flex justify-end pt-2">
            <button
              type="button"
              class="bg-primary text-white px-4 py-2 rounded-xl"
              @click="showEdit = false"
            >
              {{ t('servers.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
