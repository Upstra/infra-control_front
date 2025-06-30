<script setup lang="ts">
import type { Ups } from '../types';
import { useI18n } from 'vue-i18n';

defineProps<{
  ups: Ups;
}>();
const { t } = useI18n();
</script>

<template>
  <div
    class="bg-white border rounded-2xl shadow-sm p-5 space-y-4 hover:shadow-md transition"
  >
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-neutral-darker">
        {{ ups.name }}
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-2 text-sm text-neutral-dark">
      <p>
        <strong>{{ t('ups.ip') }} :</strong> {{ ups.ip }}
      </p>
      <p>
        <strong>{{ t('ups.room_id') }} :</strong> {{ ups.roomId }}
      </p>
      <p>
        <strong>{{ t('ups.start_delay_seconds') }}</strong>
        {{ ups.grace_period_on }}s
      </p>
      <p>
        <strong>{{ t('ups.stop_delay_seconds') }}</strong>
        {{ ups.grace_period_off }}s
      </p>
    </div>

    <div class="pt-4">
      <router-link
        :to="`/ups/${ups.id}`"
        class="text-primary underline hover:text-primary-dark text-sm"
      >
        {{ t('ups.view_details') }}
      </router-link>
    </div>
  </div>
</template>
