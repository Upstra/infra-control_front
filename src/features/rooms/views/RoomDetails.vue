<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia'
import type { Room } from "../types";
import type { Server } from "../../servers/types";
import type { Ups } from "../../ups/types";
import ServerCard from "../../servers/components/ServerCard.vue";
import UpsCard from "../../ups/components/UpsCard.vue";
import { useRoomStore } from "../store"

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const roomId = route.params.id as string;
const roomStore = useRoomStore();
const { current: room, loading } = storeToRefs(roomStore);
const { fetchRoomById } = roomStore;
const servers = ref<Server[]>([]);
const upsList = ref<Ups[]>([]);

onMounted(() => fetchRoomById(roomId));
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
        {{ t('common.back') }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-neutral-dark text-lg animate-pulse">{{ t('rooms.loading') }}</p>
    </div>

    <div v-else-if="room" class="space-y-10">
      <div class="space-y-2">
        <h1 class="text-4xl font-extrabold text-neutral-darker">
          {{ room.name }}
        </h1>
        <p class="text-sm text-neutral-dark">{{ t('rooms.id_label') }} {{ room.id }}</p>
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
          {{ t('rooms.no_server_room') }}
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
          {{ t('rooms.no_ups_room') }}
        </p>
      </section>
    </div>
  </div>
</template>
