<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  Menu,
  Server,
  Users,
  Group,
  Plug,
  Building,
  Boxes,
} from "lucide-vue-next";
import TreeNavbar from "@/layouts/components/TreeNavbar.vue";

import packageJson from "../../../package.json";

const isSidebarManualOpen = ref(false);
const isHovering = ref(false);
const route = useRoute();

const isSidebarOpen = computed(() => {
  if (window.innerWidth < 768) return isSidebarManualOpen.value;
  return isHovering.value;
});

const links = [
  { name: "Serveurs", path: "/servers", icon: Server },
  { name: "Groupes", path: "/groups", icon: Group },
  { name: "Onduleurs", path: "/ups", icon: Plug },
  { name: "Salles", path: "/rooms", icon: Building },
  { name: "VMs", path: "/vms", icon: Boxes },
  { name: "Utilisateurs", path: "/users", icon: Users },
];

const toggleSidebar = () => {
  isSidebarManualOpen.value = !isSidebarManualOpen.value;
};
</script>

<template>
  <div class="flex min-h-screen bg-neutral-light text-neutral-darker">
    <aside
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      :class="[
        'flex flex-col justify-between bg-neutral-darker text-white transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div>
        <div class="flex items-center justify-between px-4 py-6">
          <img
            src="https://github.com/Upstra/.github/blob/main/PA2025%20Upstra%20Logo.png?raw=true"
            alt="Upstra Logo"
            :class="[isSidebarOpen ? 'h-12' : 'h-10', 'mx-auto w-auto']"
          />
          <button
            @click="toggleSidebar"
            class="md:hidden p-2 rounded hover:bg-white/10 transition"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
        
        <TreeNavbar :is-sidebar-open="isSidebarOpen" />

        <nav class="space-y-2">
          <router-link
            v-for="link in links"
            :key="link.path"
            :to="link.path"
            :class="[
              'flex px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200',
              isSidebarOpen ? 'items-center gap-4 justify-start' : 'justify-center',
              route.path.startsWith(link.path) && 'bg-white/10 font-semibold'
            ]"
          >
            <component :is="link.icon" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="text-sm">{{ link.name }}</span>
          </router-link>
        </nav>
      </div>

      <div class="px-4 py-4 text-xs text-white/60">
        <div v-if="isSidebarOpen">{{ packageJson.public_name }} v{{ packageJson.version }}</div>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<style scoped>
img {
  object-fit: contain;
}
</style>