<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  { name: "Serveurs", path: "/servers", icon: "🖥️" },
  { name: "Groupes", path: "/groups", icon: "👥" },
  { name: "Onduleurs", path: "/ups", icon: "🔌" },
  { name: "Salles", path: "/rooms", icon: "🏢" },
  { name: "VMs", path: "/vms", icon: "📦" },
  { name: "Utilisateurs", path: "/users", icon: "🙋‍♂️" },
];
</script>

<template>
  <div class="flex min-h-screen text-neutral-darker">
    <aside class="w-64 bg-neutral-darker text-white p-4 space-y-6">
      <h1 class="text-xl font-bold tracking-wide text-white/90">🔷 Upstra</h1>
      <nav class="space-y-2">
        <router-link
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition"
          :class="{
            'bg-white/10 text-white font-medium': route.path.startsWith(
              link.path
            ),
          }"
        >
          <span class="text-lg">{{ link.icon }}</span>
          <span>{{ link.name }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="flex-1 bg-neutral-light p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
