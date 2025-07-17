<template>
  <div class="tree-navbar" ref="scrollContainer" @scroll="handleScroll">
    <ul class="space-y-1">
      <li v-for="room in rooms" :key="room.id">
        <div
          class="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
        >
          <div
            v-if="props.isSidebarOpen"
            class="flex-shrink-0 cursor-pointer"
            @click="toggleExpand(room.id)"
          >
            <ChevronDown
              v-if="isExpanded(room.id)"
              class="w-4 h-4 text-white/60"
            />
            <ChevronRight v-else class="w-4 h-4 text-white/60" />
          </div>
          <Building class="w-4 h-4 text-white/80 flex-shrink-0" />
          <span
            v-if="props.isSidebarOpen"
            class="text-sm text-white/90 truncate font-medium flex-1 cursor-pointer"
            @click="toggleExpand(room.id)"
          >
            {{ room.name }}
          </span>
          <span
            v-if="
              props.isSidebarOpen && (room.serverCount > 0 || room.upsCount > 0)
            "
            class="text-xs text-white/50"
          >
            {{ room.serverCount + room.upsCount }}
          </span>
          <ExternalLink
            v-if="props.isSidebarOpen"
            class="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-white/60"
            @click.stop="navigateTo('room', room.id)"
          />
        </div>

        <transition name="fade">
          <ul
            v-if="isExpanded(room.id) && props.isSidebarOpen"
            class="ml-4 mt-1 space-y-0.5"
          >
            <li v-for="server in getServersForRoom(room.id)" :key="server.id">
              <div
                class="group flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                <div
                  class="flex-shrink-0 cursor-pointer"
                  @click="toggleExpand(server.id)"
                >
                  <ChevronDown
                    v-if="isExpanded(server.id)"
                    class="w-3 h-3 text-white/50"
                  />
                  <ChevronRight v-else class="w-3 h-3 text-white/50" />
                </div>
                <Server class="w-4 h-4 text-white/70 flex-shrink-0" />
                <span
                  class="text-xs text-white/80 truncate flex-1 cursor-pointer"
                  @click="toggleExpand(server.id)"
                >
                  {{ server.name }}
                </span>
                <span
                  v-if="getVmsForServer(server.id).length > 0"
                  class="text-xs text-white/50"
                >
                  {{ getVmsForServer(server.id).length }}
                </span>
                <ExternalLink
                  class="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-white/60"
                  @click.stop="navigateTo('server', server.id)"
                />
              </div>

              <transition name="fade">
                <ul v-if="isExpanded(server.id)" class="ml-6 mt-1 space-y-0.5">
                  <li v-for="vm in getVmsForServer(server.id)" :key="vm.id">
                    <div
                      class="group flex items-center gap-2 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
                    >
                      <Minus class="w-2 h-2 text-white/40 flex-shrink-0" />
                      <Box class="w-3 h-3 text-white/60 flex-shrink-0" />
                      <span class="text-xs text-white/70 truncate flex-1">
                        {{ vm.name }}
                      </span>
                      <ExternalLink
                        class="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-white/60"
                        @click.stop="navigateTo('vm', vm.id)"
                      />
                    </div>
                  </li>
                  <li
                    v-if="loadingVms[server.id]"
                    class="flex items-center gap-2 px-2 py-0.5"
                  >
                    <span class="text-xs text-white/50">{{
                      t('common.loading')
                    }}</span>
                  </li>
                </ul>
              </transition>
            </li>

            <li v-for="ups in getUpsForRoom(room.id)" :key="ups.id">
              <div
                class="group flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                <Minus class="w-3 h-3 text-white/50 flex-shrink-0" />
                <Plug class="w-4 h-4 text-white/70 flex-shrink-0" />
                <span class="text-xs text-white/80 truncate flex-1">
                  {{ ups.name }}
                </span>
                <ExternalLink
                  class="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-white/60"
                  @click.stop="navigateTo('ups', ups.id)"
                />
              </div>
            </li>
          </ul>
        </transition>
      </li>

      <li v-if="loading" class="text-center py-2">
        <span class="text-xs text-white/50">{{ t('common.loading') }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  Box,
  Building,
  ChevronDown,
  ChevronRight,
  Minus,
  Plug,
  Server,
  ExternalLink,
} from 'lucide-vue-next';
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { roomApi } from '@/features/rooms/api';
import type { RoomTreeDto } from '@/features/rooms/types';

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const router = useRouter();

const scrollContainer = ref<HTMLElement>();
const expandedSet = ref(new Set<string>());
const loading = ref(false);
const loadingVms = ref<Record<string, boolean>>({});

const roomTreeData = ref<RoomTreeDto[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageLimit = ref(10);
const hasMoreData = ref(true);

const rooms = computed(() => {
  return roomTreeData.value.map((room) => ({
    ...room,
    serverCount: room.servers.length,
    upsCount: room.ups.length,
  }));
});

const getServersForRoom = (roomId: string) => {
  const room = roomTreeData.value.find((r) => r.id === roomId);
  return room?.servers || [];
};

const getUpsForRoom = (roomId: string) => {
  const room = roomTreeData.value.find((r) => r.id === roomId);
  return room?.ups || [];
};

const getVmsForServer = (serverId: string) => {
  for (const room of roomTreeData.value) {
    const server = room.servers.find((s) => s.id === serverId);
    if (server) {
      return server.vms;
    }
  }
  return [];
};

const isExpanded = (uuid: string) => expandedSet.value.has(uuid);

const toggleExpand = async (uuid: string) => {
  if (expandedSet.value.has(uuid)) {
    expandedSet.value.delete(uuid);
  } else {
    expandedSet.value.add(uuid);
  }
};

const loadInitialData = async () => {
  loading.value = true;
  try {
    const response = await roomApi.fetchRoomTree(
      currentPage.value,
      pageLimit.value,
    );
    roomTreeData.value = response.rooms;
    total.value = response.total;
    currentPage.value = response.page;
    pageLimit.value = response.limit;
    hasMoreData.value = currentPage.value * pageLimit.value < total.value;
  } finally {
    loading.value = false;
  }
};

const loadMoreData = async () => {
  if (loading.value || !hasMoreData.value) return;

  loading.value = true;
  try {
    const nextPage = currentPage.value + 1;
    const response = await roomApi.fetchRoomTree(nextPage, pageLimit.value);
    roomTreeData.value.push(...response.rooms);
    currentPage.value = response.page;
    hasMoreData.value = currentPage.value * pageLimit.value < total.value;
  } finally {
    loading.value = false;
  }
};

const handleScroll = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const scrollPosition = container.scrollTop + container.clientHeight;
  const scrollHeight = container.scrollHeight;

  if (scrollPosition > scrollHeight - 100) {
    if (hasMoreData.value) {
      loadMoreData();
    }
  }
};

watch(
  () => props.isSidebarOpen,
  (newValue) => {
    if (!newValue) {
      expandedSet.value.clear();
    }
  },
);

const navigateTo = (type: 'room' | 'server' | 'ups' | 'vm', id: string) => {
  switch (type) {
    case 'room':
      router.push(`/rooms/${id}`);
      break;
    case 'server':
      router.push(`/servers/${id}`);
      break;
    case 'ups':
      router.push(`/ups/${id}`);
      break;
    case 'vm':
      router.push(`/vms/${id}`);
      break;
  }
};

onMounted(() => {
  loadInitialData();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.tree-navbar {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.tree-navbar:hover {
  max-height: 400px;
}

.tree-navbar::-webkit-scrollbar {
  width: 6px;
}

.tree-navbar::-webkit-scrollbar-track {
  background: transparent;
}

.tree-navbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.tree-navbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
