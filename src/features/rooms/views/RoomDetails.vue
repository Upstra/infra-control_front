<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Server, BatteryCharging } from 'lucide-vue-next';
import ErrorAlert from '@/shared/components/ErrorAlert.vue';
import RoomEnvironment from '../components/RoomEnvironment.vue';
import RoomThresholdsCard from '../components/RoomThresholdsCard.vue';
import RoomResourceList from '../components/RoomResourceList.vue';
import { roomApi } from '../api';
import { useRoomEnvironments } from '../composables/useRoomEnvironments';
import type { RoomResponseDto } from '../types';

const route = useRoute();
const { t } = useI18n();
const environments = useRoomEnvironments();

const roomId = route.params.id as string;
const room = ref<RoomResponseDto | null>(null);
const loading = ref(true);
const failed = ref(false);

onMounted(async () => {
  try {
    room.value = await roomApi.fetchRoomById(roomId);
    await environments.load(roomId);
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});

const environment = computed(() => environments.of(roomId));
const hottestServer = computed(() => {
  const id = environment.value?.maxInletServerId;
  return (
    (id && room.value?.servers?.find((server) => server.id === id)?.name) ||
    null
  );
});
const servers = computed(() =>
  (room.value?.servers ?? []).map((server) => ({
    id: server.id,
    name: server.name,
    meta: server.ip,
    to: `/servers/${server.id}`,
  })),
);
const upsList = computed(() =>
  (room.value?.ups ?? []).map((ups) => ({
    id: ups.id,
    name: ups.name,
    meta: ups.ip,
    to: `/ups/${ups.id}`,
  })),
);
</script>

<template>
  <div class="flex flex-col gap-6">
    <router-link
      to="/rooms"
      class="inline-flex items-center gap-2 self-start text-caption font-medium text-text-muted hover:text-text-strong"
    >
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('roomsPage.back') }}
    </router-link>
    <div v-if="loading" class="flex flex-col gap-3" aria-busy="true">
      <div class="h-8 w-48 animate-pulse rounded-sm bg-surface-raised" />
      <div class="h-32 animate-pulse rounded-lg bg-surface-raised" />
    </div>
    <ErrorAlert
      v-else-if="failed || !room"
      :message="t('roomsPage.load_error')"
    />
    <template v-else>
      <h1 class="m-0 text-display text-text-strong">{{ room.name }}</h1>
      <RoomEnvironment
        v-if="environment"
        :environment="environment"
        :thresholds="room"
        :server-name="hottestServer"
      />
      <div class="grid gap-5 md:grid-cols-2">
        <RoomResourceList
          :icon="Server"
          :title="t('roomsPage.servers_title')"
          :items="servers"
          :empty="t('roomsPage.no_servers')"
        />
        <RoomResourceList
          :icon="BatteryCharging"
          :title="t('roomsPage.ups_title')"
          :items="upsList"
          :empty="t('roomsPage.no_ups')"
        />
      </div>
      <RoomThresholdsCard :room="room" @saved="room = { ...room, ...$event }" />
    </template>
  </div>
</template>
