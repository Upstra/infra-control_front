<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import {
  Menu,
  Server,
  Users,
  Group,
  Plug,
  Building,
  Boxes,
  ShieldCheck,
  History as HistoryIcon,
} from 'lucide-vue-next';
import { BellIcon } from '@heroicons/vue/24/outline';
import UserDropdown from '@/layouts/components/UserDropdown.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import { useCommandPalette } from '@/components/CommandPalette/useCommandPalette';

import TreeNavbar from '@/layouts/components/TreeNavbar.vue';

import packageJson from '../../../package.json';
import { useAuthStore } from '@/features/auth/store';

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

const { t } = useI18n();
const { openCommandPalette } = useCommandPalette();
const auth = useAuthStore();
const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);

const links = [
  { nameKey: 'nav.servers', path: '/servers', icon: Server },
  { nameKey: 'nav.groups', path: '/groups', icon: Group },
  { nameKey: 'nav.ups', path: '/ups', icon: Plug },
  { nameKey: 'nav.rooms', path: '/rooms', icon: Building },
  { nameKey: 'nav.users', path: '/users', icon: Users },
  { nameKey: 'nav.changelog', path: '/changelog', icon: HistoryIcon },
];

const adminLinks = [
  { nameKey: 'administration.users', path: '/admin/users', icon: Users },
  { nameKey: 'administration.roles', path: '/admin/roles', icon: ShieldCheck },
  {
    nameKey: 'administration.history',
    path: '/admin/history',
    icon: HistoryIcon,
  },
];
</script>

<template>
  <div
    class="flex min-h-screen bg-neutral-light dark:bg-neutral-darker text-neutral-darker dark:text-white"
  >
    <aside
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      :class="[
        'flex flex-col justify-between bg-neutral-darker dark:bg-black text-white transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div class="flex flex-col h-full">
        <div
          class="flex items-center justify-between px-4 py-6 border-b border-white/10"
        >
          <img
            src="https://github.com/Upstra/.github/blob/main/PA2025%20Upstra%20Logo.png?raw=true"
            alt="Upstra Logo"
            :class="[isSidebarOpen ? 'h-12' : 'h-10', 'mx-auto w-auto']"
            class="cursor-pointer"
            @click="$router.push('/')"
          />
          <button
            @click="toggleSidebar"
            class="md:hidden p-2 rounded hover:bg-white/10 transition"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div class="px-4 py-4">
            <div v-if="isSidebarOpen" class="mb-3">
              <div
                class="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wide"
              >
                <Boxes class="w-4 h-4" />
                <span>{{ t('common.infrastructure') }}</span>
              </div>
            </div>
            <div class="bg-white/5 rounded-lg p-2">
              <TreeNavbar :is-sidebar-open="isSidebarOpen" />
            </div>
          </div>

          <div class="px-4 py-4 border-t border-white/10">
            <div v-if="isSidebarOpen" class="mb-3">
              <div
                class="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wide"
              >
                <Menu class="w-4 h-4" />
                <span>Navigation</span>
              </div>
            </div>
            <nav class="space-y-1">
              <router-link
                v-for="link in links"
                :key="link.path"
                :to="link.path"
                :class="[
                  'flex px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-200',
                  isSidebarOpen
                    ? 'items-center gap-3 justify-start'
                    : 'justify-center',
                  route.path.startsWith(link.path) &&
                    'bg-white/15 font-semibold border-l-3 border-white/50',
                ]"
              >
                <component :is="link.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="isSidebarOpen" class="text-sm truncate">{{
                  t(link.nameKey)
                }}</span>
              </router-link>
            </nav>
          </div>

          <div v-if="isAdmin" class="px-4 py-4 border-t border-white/10">
            <div v-if="isSidebarOpen" class="mb-3">
              <div
                class="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wide"
              >
                <ShieldCheck class="w-4 h-4" />
                <span>{{ t('administration.section') }}</span>
              </div>
            </div>
            <nav class="space-y-1">
              <router-link
                v-for="link in adminLinks"
                :key="link.path"
                :to="link.path"
                :class="[
                  'flex px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-200',
                  isSidebarOpen
                    ? 'items-center gap-3 justify-start'
                    : 'justify-center',
                  route.path.startsWith(link.path) &&
                    'bg-white/15 font-semibold border-l-3 border-white/50',
                ]"
              >
                <component :is="link.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="isSidebarOpen" class="text-sm truncate">{{
                  t(link.nameKey)
                }}</span>
              </router-link>
            </nav>
          </div>
        </div>
      </div>

      <div class="px-4 py-4 text-xs text-white/60">
        <div v-if="isSidebarOpen">
          {{ packageJson.public_name }} v{{ packageJson.version }}
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div
        class="flex items-center justify-between px-8 py-4 bg-white dark:bg-neutral-darker border-b border-neutral-200 dark:border-neutral-700"
      >
        <button
          @click="openCommandPalette"
          class="group relative w-1/3 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all text-left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
          <span
            class="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors flex-1"
          >
            {{ t('command_palette.search_placeholder') }}
          </span>
          <kbd
            class="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
          >
            <span class="text-xs">⌘</span>K
          </kbd>
        </button>

        <div class="flex items-center gap-4">
          <UserDropdown />
          <button
            class="relative p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <BellIcon class="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>
      </div>

      <hr class="border-t border-neutral-200 dark:border-neutral-700" />

      <div class="p-8">
        <slot />
      </div>
    </main>

    <CommandPalette />
  </div>
</template>

<style scoped>
img {
  object-fit: contain;
}
</style>
