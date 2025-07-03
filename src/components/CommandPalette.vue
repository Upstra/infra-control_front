<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/20 backdrop-blur-sm"
        @click="closeCommandPalette"
      >
        <div
          class="w-full max-w-2xl mt-24 bg-white rounded-2xl shadow-2xl border border-neutral-200/50 overflow-hidden"
          @click.stop
        >
          <div class="flex items-center gap-4 p-6 border-b border-neutral-100">
            <div class="flex items-center flex-1 gap-3 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus-within:border-primary focus-within:bg-white transition-all">
              <SearchIcon class="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                :placeholder="t('command_palette.placeholder')"
                class="flex-1 bg-transparent border-0 outline-none text-neutral-800 placeholder-neutral-400"
                @keydown="handleKeydown"
              />
            </div>
            <div class="flex items-center gap-2">
              <kbd class="px-2 py-1 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-md">
                ⌘K
              </kbd>
              <button
                @click="closeCommandPalette"
                class="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="max-h-96 overflow-y-auto">
            <div v-if="Object.keys(groupedActions).length === 0" class="p-8 text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <SearchIcon class="w-8 h-8 text-neutral-400" />
              </div>
              <p class="text-neutral-500 font-medium">{{ t('command_palette.no_results') }}</p>
              <p class="text-sm text-neutral-400 mt-1">{{ t('command_palette.try_different') }}</p>
            </div>

            <template v-for="(grouped, group) in groupedActions" :key="group">
              <div class="px-6 py-3 bg-neutral-50 border-b border-neutral-100">
                <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {{ group }}
                </h3>
              </div>
              <div class="py-2">
                <button
                  v-for="(action, index) in grouped"
                  :key="action.label"
                  :class="[
                    'w-full flex items-center justify-between gap-4 px-6 py-3 text-left hover:bg-neutral-50 transition-colors',
                    selectedIndex === getActionIndex(group, index) && 'bg-primary/5 border-r-2 border-primary'
                  ]"
                  @click="handleAction(action)"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100">
                      <component :is="action.icon" class="w-4 h-4 text-neutral-600" />
                    </div>
                    <div>
                      <div class="font-medium text-neutral-800">{{ t(action.label) }}</div>
                      <div v-if="action.description" class="text-sm text-neutral-500">
                        {{ t(action.description) }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd
                      v-if="action.shortcut"
                      class="px-2 py-1 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-md"
                    >
                      {{ action.shortcut }}
                    </kbd>
                    <ChevronRightIcon class="w-4 h-4 text-neutral-400" />
                  </div>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useMagicKeys } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/features/auth/store';
import { useCommandPalette } from '@/shared/composables/useCommandPalette';
import {
  Server,
  Users,
  Group,
  Plug,
  Building,
  Settings,
  LogOut,
  Moon,
  Sun,
  Plus,
  Eye,
  Grid3X3,
  List,
  History,
  Shield,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-vue-next';
import { XMarkIcon } from '@heroicons/vue/24/outline';

interface CommandAction {
  group: string;
  label: string;
  description?: string;
  icon: any;
  fn: () => void;
  shortcut?: string;
  path?: string;
  onlyInUsers?: boolean;
  adminOnly?: boolean;
}

const isOpen = ref(false);
const query = ref('');
const selectedIndex = ref(0);
const searchInput = ref<HTMLInputElement>();


const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const auth = useAuthStore();
const { switchView } = useCommandPalette();

const isAdmin = computed(() => 
  auth.currentUser?.roles?.some(role => role.isAdmin) ?? false
);

const actions: CommandAction[] = [
  {
    group: 'command_palette.groups.navigation',
    label: 'command_palette.dashboard',
    description: 'command_palette.dashboard_desc',
    icon: Grid3X3,
    fn: () => navigateTo('/'),
    shortcut: 'D',
    path: '/',
  },
  {
    group: 'command_palette.groups.navigation',
    label: 'command_palette.servers',
    description: 'command_palette.servers_desc',
    icon: Server,
    fn: () => navigateTo('/servers'),
    shortcut: 'S',
    path: '/servers',
  },
  {
    group: 'command_palette.groups.navigation',
    label: 'command_palette.users',
    description: 'command_palette.users_desc',
    icon: Users,
    fn: () => navigateTo('/users'),
    shortcut: 'U',
    path: '/users',
  },
  {
    group: 'command_palette.groups.navigation',
    label: 'command_palette.rooms',
    description: 'command_palette.rooms_desc',
    icon: Building,
    fn: () => navigateTo('/rooms'),
    shortcut: 'R',
    path: '/rooms',
  },
  {
    group: 'command_palette.groups.navigation',
    label: 'command_palette.ups',
    description: 'command_palette.ups_desc',
    icon: Plug,
    fn: () => navigateTo('/ups'),
    shortcut: 'P',
    path: '/ups',
  },
  {
    group: 'command_palette.groups.views',
    label: 'command_palette.table_view',
    description: 'command_palette.table_view_desc',
    icon: List,
    fn: () => switchView('table'),
    onlyInUsers: true,
  },
  {
    group: 'command_palette.groups.views',
    label: 'command_palette.card_view',
    description: 'command_palette.card_view_desc',
    icon: Grid3X3,
    fn: () => switchView('card'),
    onlyInUsers: true,
  },
  {
    group: 'command_palette.groups.create',
    label: 'command_palette.create_server',
    description: 'command_palette.create_server_desc',
    icon: Plus,
    fn: () => navigateTo('/servers/create'),
    shortcut: '⌘+S',
  },
  {
    group: 'command_palette.groups.create',
    label: 'command_palette.create_room',
    description: 'command_palette.create_room_desc',
    icon: Plus,
    fn: () => navigateTo('/rooms/create'),
    shortcut: '⌘+R',
  },
  {
    group: 'command_palette.groups.create',
    label: 'command_palette.create_ups',
    description: 'command_palette.create_ups_desc',
    icon: Plus,
    fn: () => navigateTo('/ups/create'),
    shortcut: '⌘+P',
  },
  {
    group: 'command_palette.groups.admin',
    label: 'command_palette.admin_users',
    description: 'command_palette.admin_users_desc',
    icon: Shield,
    fn: () => navigateTo('/admin/users'),
    adminOnly: true,
  },
  {
    group: 'command_palette.groups.admin',
    label: 'command_palette.admin_roles',
    description: 'command_palette.admin_roles_desc',
    icon: Shield,
    fn: () => navigateTo('/admin/roles'),
    adminOnly: true,
  },
  {
    group: 'command_palette.groups.admin',
    label: 'command_palette.admin_history',
    description: 'command_palette.admin_history_desc',
    icon: History,
    fn: () => navigateTo('/admin/history'),
    adminOnly: true,
  },
  {
    group: 'command_palette.groups.general',
    label: 'command_palette.settings',
    description: 'command_palette.settings_desc',
    icon: Settings,
    fn: () => navigateTo('/settings'),
  },
  {
    group: 'command_palette.groups.general',
    label: 'command_palette.profile',
    description: 'command_palette.profile_desc',
    icon: Users,
    fn: () => navigateTo('/profile'),
  },
  {
    group: 'command_palette.groups.general',
    label: 'command_palette.changelog',
    description: 'command_palette.changelog_desc',
    icon: History,
    fn: () => navigateTo('/changelog'),
  },
  {
    group: 'command_palette.groups.general',
    label: 'command_palette.logout',
    description: 'command_palette.logout_desc',
    icon: LogOut,
    fn: () => handleLogout(),
    shortcut: '⌘+⇧+Q',
  },
];

const filteredActions = computed(() => {
  return actions.filter((action) => {
    if (action.onlyInUsers && !route.path.startsWith('/users')) return false;
    if (action.adminOnly && !isAdmin.value) return false;
    if (action.path && route.path === action.path) return false;
    
    if (!query.value) return true;
    
    const searchTerm = query.value.toLowerCase();
    const label = t(action.label).toLowerCase();
    const description = action.description ? t(action.description).toLowerCase() : '';
    const group = t(action.group).toLowerCase();
    
    return label.includes(searchTerm) || description.includes(searchTerm) || group.includes(searchTerm);
  });
});

const groupedActions = computed(() => {
  return filteredActions.value.reduce((acc, action) => {
    const group = t(action.group);
    if (!acc[group]) acc[group] = [];
    acc[group].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);
});

const allActions = computed(() => {
  return Object.values(groupedActions.value).flat();
});

const getActionIndex = (group: string, index: number) => {
  let totalIndex = 0;
  for (const [groupName, actions] of Object.entries(groupedActions.value)) {
    if (groupName === group) {
      return totalIndex + index;
    }
    totalIndex += actions.length;
  }
  return totalIndex;
};

const openCommandPalette = () => {
  isOpen.value = true;
  selectedIndex.value = 0;
  nextTick(() => {
    searchInput.value?.focus();
  });
};

const closeCommandPalette = () => {
  isOpen.value = false;
  query.value = '';
  selectedIndex.value = 0;
};

const handleAction = (action: CommandAction) => {
  action.fn();
  closeCommandPalette();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, allActions.value.length - 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (allActions.value[selectedIndex.value]) {
      handleAction(allActions.value[selectedIndex.value]);
    }
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};

const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};

const { ctrl_k, meta_k, escape } = useMagicKeys();

watch([ctrl_k, meta_k], ([ctrl, meta]) => {
  if (ctrl || meta) {
    openCommandPalette();
  }
});

watch(escape, (pressed) => {
  if (pressed && isOpen.value) {
    closeCommandPalette();
  }
});

watch(query, () => {
  selectedIndex.value = 0;
});

defineExpose({
  openCommandPalette,
  closeCommandPalette,
});
</script>

