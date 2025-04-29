<script setup lang="ts">
import type { Ups } from "../types";

defineProps<{
  ups: Ups;
}>();
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
      <p><strong>IP :</strong> {{ ups.ip }}</p>
      <p><strong>ID Salle :</strong> {{ ups.roomId }}</p>
      <p><strong>Temps démarrage :</strong> {{ ups.grace_period_on }}s</p>
      <p><strong>Temps arrêt :</strong> {{ ups.grace_period_off }}s</p>
    </div>

    <div class="pt-4">
      <router-link
        :to="`/ups/${ups.id}`"
        class="text-primary underline hover:text-primary-dark text-sm"
      >
        Voir détails →
      </router-link>
    </div>
  </div>
</template>
