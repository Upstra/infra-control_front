<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useUpsStore } from "../store";

const route = useRoute();
const router = useRouter();
const upsId = route.params.id as string;

const upsStore = useUpsStore();
const { current: ups, loading } = storeToRefs(upsStore);
const { fetchUpsById } = upsStore;

const { t } = useI18n();

onMounted(() => fetchUpsById(upsId));
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
