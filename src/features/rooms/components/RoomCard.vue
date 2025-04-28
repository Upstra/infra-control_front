<script setup lang="ts">
import type { Room } from "../types";

defineProps<{
  room: Room;
}>();
</script>

<template>
  <div
    class="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition space-y-4"
  >
    <h2 class="text-xl font-semibold text-neutral-darker">
      {{ room.name }}
    </h2>

    <div class="text-sm text-neutral-dark">
      <p><strong>ID :</strong> {{ room.id }}</p>
    </div>

    <router-link
      :to="`/rooms/${room.id}`"
      class="block mt-4 w-full text-center py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
    >
      Voir les détails
    </router-link>
  </div>
</template>
