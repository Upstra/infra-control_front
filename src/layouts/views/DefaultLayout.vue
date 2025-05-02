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
          <span class="text-xl font-bold tracking-wide" v-if="isSidebarOpen"
            >Upstra</span
          >
          <span class="text-2xl" v-else>🔷</span>
          <button
            @click="toggleSidebar"
            class="md:hidden p-2 rounded hover:bg-white/10 transition"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
        
        <TreeNavbar :is-sidebar-open="isSidebarOpen" />
      </div>

      <div class="px-4 py-4 text-xs text-white/60">
        <div v-if="isSidebarOpen">Upstra v1.0.0</div>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
