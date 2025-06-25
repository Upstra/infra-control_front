<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { type Ups, UpsState } from "../types";

const route = useRoute();
const router = useRouter();

const upsId = route.params.id as string;
const ups = ref<Ups | null>(null);
const loading = ref(true);
const { t } = useI18n();

const loadUpsDetail = async () => {
  try {
    ups.value = getMockUps().find((u) => u.id === upsId) || null;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadUpsDetail);

const getMockUps = (): Ups[] => [
  {
    id: "ups-1",
    name: "Onduleur Principal",
    ip: "192.168.0.50",
    grace_period_on: 10,
    grace_period_off: 15,
    roomId: "room-1",
    state: UpsState.Active,
  },
  {
    id: "ups-2",
    name: "Onduleur Secondaire",
    ip: "192.168.0.51",
    grace_period_on: 5,
    grace_period_off: 10,
    roomId: "room-2",
    state: UpsState.Inactive,
  },
];
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <button
      @click="router.back()"
      class="text-primary underline mb-4 hover:text-primary-dark transition"
    >
      {{ t('ups.back') }}
    </button>

    <div v-if="loading" class="text-center text-neutral-dark">
      {{ t('ups.loading') }}
    </div>

    <div v-else-if="ups" class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-neutral-darker">{{ ups.name }}</h1>
        <p class="text-sm text-neutral-dark">{{ t('ups.ups_id') }} {{ ups.id }}</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <p><strong>{{ t('ups.ip') }} :</strong> {{ ups.ip }}</p>
        <p>
          <strong>{{ t('ups.start_delay_seconds') }}</strong> {{ ups.grace_period_on }}s
        </p>
        <p>
          <strong>{{ t('ups.stop_delay_seconds') }}</strong> {{ ups.grace_period_off }}s
        </p>
        <p><strong>{{ t('ups.room_label') }}</strong> {{ ups.roomId }}</p>
      </div>
    </div>
  </div>
</template>
