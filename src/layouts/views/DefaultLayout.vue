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
import { BellIcon } from "@heroicons/vue/24/outline";
import UserDropdown from "@/layouts/components/UserDropdown.vue";

import TreeNavbar from "@/layouts/components/TreeNavbar.vue";

import packageJson from "../../../package.json";

const isSidebarManualOpen = ref(false);
const isHovering = ref(false);
const route = useRoute();

const isSidebarOpen = computed(() => {
  if (window.innerWidth < 768) return isSidebarManualOpen.value;
  return isHovering.value;
});

const toggleSidebar = () => {
  isSidebarManualOpen.value = !isSidebarManualOpen.value;
};

const links = [
  { name: "Serveurs", path: "/servers", icon: Server },
  { name: "Groupes", path: "/groups", icon: Group },
  { name: "Onduleurs", path: "/ups", icon: Plug },
  { name: "Salles", path: "/rooms", icon: Building },
  { name: "VMs", path: "/vms", icon: Boxes },
  { name: "Utilisateurs", path: "/users", icon: Users },
];
</script>

<template>
  <div class="flex min-h-screen bg-neutral-light text-neutral-darker">
    <aside
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      :class="[
        'flex flex-col justify-between bg-neutral-darker text-white transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]">
      <div>
        <div class="flex items-center justify-between px-4 py-6">
          <img
            src="https://github.com/Upstra/.github/blob/main/PA2025%20Upstra%20Logo.png?raw=true"
            alt="Upstra Logo"
            :class="[isSidebarOpen ? 'h-12' : 'h-10', 'mx-auto w-auto']"
            class="cursor-pointer"
            @click="$router.push('/')" />
          <button
            @click="toggleSidebar"
            class="md:hidden p-2 rounded hover:bg-white/10 transition">
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
              isSidebarOpen
                ? 'items-center gap-4 justify-start'
                : 'justify-center',
              route.path.startsWith(link.path) && 'bg-white/10 font-semibold',
            ]">
            <component :is="link.icon" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="text-sm">{{ link.name }}</span>
          </router-link>
        </nav>
      </div>

      <div class="px-4 py-4 text-xs text-white/60">
        <div v-if="isSidebarOpen">
          {{ packageJson.public_name }} v{{ packageJson.version }}
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div
        class="flex items-center justify-between px-8 py-4 bg-white border-b border-neutral-200">
        <div class="relative w-1/3">
          <input
            type="text"
            placeholder="Search"
            class="w-full px-4 py-2 pl-10 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="absolute left-3 top-2.5 w-4 h-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </div>

        <div class="flex items-center gap-4">
          <UserDropdown />
          <button class="relative p-2 rounded hover:bg-neutral-100 transition">
            <BellIcon class="w-5 h-5 text-neutral-700" />
          </button>
        </div>
      </div>

      <hr class="border-t border-neutral-200" />

      <div class="p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
img {
  object-fit: contain;
}
</style>
