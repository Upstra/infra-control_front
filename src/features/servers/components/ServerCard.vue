<script setup lang="ts">
import type { Server } from "../types";

defineProps<{
  server: Server;
}>();
</script>

<template>
  <div
    class="bg-white border rounded-2xl shadow-sm p-5 space-y-4 hover:shadow-md transition"
  >
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-neutral-darker">
        {{ server.name }}
      </h2>
      <span
        class="px-3 py-1 text-xs font-semibold rounded-full"
        :class="{
          'bg-success/10 text-success': server.state === 'active',
          'bg-danger/10 text-danger': server.state === 'inactive',
        }"
      >
        {{ server.state === "active" ? "Actif" : "Inactif" }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-x-4 text-sm text-neutral-dark">
      <div class="space-y-1">
        <p><strong>IP :</strong> {{ server.ip }}</p>
        <p><strong>Type :</strong> {{ server.type }}</p>
        <p><strong>Priorité :</strong> {{ server.priority }}</p>
        <p>
          <strong>Admin URL :<br /></strong>
          <a
            :href="server.adminUrl"
            target="_blank"
            class="text-primary underline truncate"
          >
            {{ server.adminUrl }}
          </a>
        </p>
      </div>

      <div class="space-y-1">
        <p><strong>Groupe :</strong> {{ server.groupId }}</p>
        <p><strong>Salle :</strong> {{ server.roomId }}</p>
        <p><strong>Onduleur :</strong> {{ server.upsId || "—" }}</p>
        <p><strong>Temps arrêt :</strong> {{ server.grace_period_off }}s</p>
        <p><strong>Temps démarrage :</strong> {{ server.grace_period_on }}s</p>
      </div>
    </div>

    <div
      v-if="server.ilo"
      class="mt-4 p-3 bg-neutral-light rounded-xl text-sm text-neutral-darker"
    >
      <h3 class="font-semibold mb-1">🎛️ iLO :</h3>
      <p><strong>Nom :</strong> {{ server.ilo.name }}</p>
      <p><strong>IP :</strong> {{ server.ilo.ip }}</p>
      <p><strong>Login :</strong> {{ server.ilo.login }}</p>
    </div>
  </div>
</template>
