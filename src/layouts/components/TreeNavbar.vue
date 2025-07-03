<template>
  <div class="tree-navbar" ref="scrollContainer" @scroll="handleScroll">
    <ul class="space-y-1">
      <li v-for="room in rooms" :key="room.id">
        <div
          class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
          @click="props.isSidebarOpen ? toggleExpand(room.id) : null"
        >
          <div v-if="props.isSidebarOpen" class="flex-shrink-0">
            <ChevronDown
              v-if="isExpanded(room.id)"
              class="w-4 h-4 text-white/60"
            />
            <ChevronRight v-else class="w-4 h-4 text-white/60" />
          </div>
          <Building class="w-4 h-4 text-white/80 flex-shrink-0" />
          <span
            v-if="props.isSidebarOpen"
            class="text-sm text-white/90 truncate font-medium"
          >
            {{ room.name }}
          </span>
          <span
            v-if="props.isSidebarOpen && (room.serverCount > 0 || room.upsCount > 0)"
            class="ml-auto text-xs text-white/50"
          >
            {{ room.serverCount + room.upsCount }}
          </span>
        </div>

        <transition name="fade">
          <ul
            v-if="isExpanded(room.id) && props.isSidebarOpen"
            class="ml-4 mt-1 space-y-0.5"
          >
            <!-- Servers -->
            <li v-for="server in getServersForRoom(room.id)" :key="server.id">
              <div
                class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                @click="toggleExpand(server.id)"
              >
                <div class="flex-shrink-0">
                  <ChevronDown
                    v-if="isExpanded(server.id)"
                    class="w-3 h-3 text-white/50"
                  />
                  <ChevronRight v-else class="w-3 h-3 text-white/50" />
                </div>
                <Server class="w-4 h-4 text-white/70 flex-shrink-0" />
                <span class="text-xs text-white/80 truncate">
                  {{ server.name }}
                </span>
                <span
                  v-if="server.type === 'physical' && getVmsForServer(server.id).length > 0"
                  class="ml-auto text-xs text-white/50"
                >
                  {{ getVmsForServer(server.id).length }}
                </span>
              </div>

              <!-- VMs -->
              <transition name="fade">
                <ul
                  v-if="isExpanded(server.id) && server.type === 'physical'"
                  class="ml-6 mt-1 space-y-0.5"
                >
                  <li v-for="vm in getVmsForServer(server.id)" :key="vm.id">
                    <div
                      class="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
                    >
                      <Minus class="w-2 h-2 text-white/40 flex-shrink-0" />
                      <Box class="w-3 h-3 text-white/60 flex-shrink-0" />
                      <span class="text-xs text-white/70 truncate">
                        {{ vm.name }}
                      </span>
                    </div>
                  </li>
                  <li v-if="loadingVms[server.id]" class="flex items-center gap-2 px-2 py-0.5">
                    <span class="text-xs text-white/50">{{ $t('common.loading') }}</span>
                  </li>
                </ul>
              </transition>
            </li>
            
            <!-- UPS -->
            <li v-for="ups in getUpsForRoom(room.id)" :key="ups.id">
              <div
                class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                <Minus class="w-3 h-3 text-white/50 flex-shrink-0" />
                <Plug class="w-4 h-4 text-white/70 flex-shrink-0" />
                <span class="text-xs text-white/80 truncate">
                  {{ ups.name }}
                </span>
              </div>
            </li>
          </ul>
        </transition>
      </li>
      
      <!-- Loading indicator -->
      <li v-if="loading" class="text-center py-2">
        <span class="text-xs text-white/50">{{ $t('common.loading') }}</span>
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
} from 'lucide-vue-next';
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoomStore } from '@/features/rooms/store';
import { useServerStore } from '@/features/servers/store';
import { useUpsStore } from '@/features/ups/store';
import type { Server as ServerType } from '@/features/servers/types';
import type { Ups } from '@/features/ups/types';

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const { t: $t } = useI18n();
const roomStore = useRoomStore();
const serverStore = useServerStore();
const upsStore = useUpsStore();

const scrollContainer = ref<HTMLElement>();
const expandedSet = ref(new Set<string>());
const loading = ref(false);
const loadingVms = ref<Record<string, boolean>>({});

// Pagination states
const roomPage = ref(1);
const serverPage = ref(1);
const upsPage = ref(1);
const hasMoreRooms = ref(true);
const hasMoreServers = ref(true);
const hasMoreUps = ref(true);

// Data
const rooms = computed(() => {
  return roomStore.list.map(room => ({
    ...room,
    serverCount: getServersForRoom(room.id).length,
    upsCount: getUpsForRoom(room.id).length,
  }));
});

const allServers = ref<ServerType[]>([]);
const allUps = ref<Ups[]>([]);
const vmsByServer = ref<Record<string, ServerType[]>>({});

const getServersForRoom = (roomId: string) => {
  return allServers.value.filter(server => server.roomId === roomId && server.type === 'physical');
};

const getUpsForRoom = (roomId: string) => {
  return allUps.value.filter(ups => ups.roomId === roomId);
};

const getVmsForServer = (serverId: string) => {
  return vmsByServer.value[serverId] || [];
};

const isExpanded = (uuid: string) => expandedSet.value.has(uuid);

const toggleExpand = async (uuid: string) => {
  if (expandedSet.value.has(uuid)) {
    expandedSet.value.delete(uuid);
  } else {
    expandedSet.value.add(uuid);
    
    // Load VMs for server if it's a physical server
    const server = allServers.value.find(s => s.id === uuid);
    if (server && server.type === 'physical' && !vmsByServer.value[uuid]) {
      await loadVmsForServer(uuid);
    }
  }
};

const loadVmsForServer = async (serverId: string) => {
  if (loadingVms.value[serverId]) return;
  
  loadingVms.value[serverId] = true;
  try {
    // TODO: to fix when endpoint is available
    await serverStore.fetchServers(1, 100);
    const physicalServer = allServers.value.find(s => s.id === serverId);
    if (physicalServer) {
      const vms = serverStore.list.filter(s => 
        s.type === 'virtual' && s.roomId === physicalServer.roomId
      );
      vmsByServer.value[serverId] = vms;
    }
  } finally {
    loadingVms.value[serverId] = false;
  }
};

const loadInitialData = async () => {
  loading.value = true;
  try {
    await roomStore.fetchRooms();
    
    await Promise.all([
      serverStore.fetchServers(1, 50),
      upsStore.fetchUps(1, 50)
    ]);
    
    allServers.value = serverStore.list.filter(s => s.type === 'physical');
    allUps.value = upsStore.list;
    
    hasMoreRooms.value = roomStore.currentPage < roomStore.totalPages;
    hasMoreServers.value = serverStore.currentPage < serverStore.totalPages;
    hasMoreUps.value = upsStore.currentPage < upsStore.totalPages;
  } finally {
    loading.value = false;
  }
};

const loadMoreData = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const promises = [];
    
    if (hasMoreRooms.value && roomStore.currentPage < roomStore.totalPages) {
      promises.push(
        roomStore.fetchRooms()
          .then(() => {
            roomPage.value++;
            hasMoreRooms.value = roomStore.currentPage < roomStore.totalPages;
          })
      );
    }
    
    if (hasMoreServers.value && serverStore.currentPage < serverStore.totalPages) {
      promises.push(
        serverStore.fetchServers(serverStore.currentPage + 1, 50)
          .then(() => {
            const newServers = serverStore.list.filter(s => 
              s.type === 'physical' && !allServers.value.find(existing => existing.id === s.id)
            );
            allServers.value.push(...newServers);
            serverPage.value++;
            hasMoreServers.value = serverStore.currentPage < serverStore.totalPages;
          })
      );
    }
    
    if (hasMoreUps.value && upsStore.currentPage < upsStore.totalPages) {
      promises.push(
        upsStore.fetchUps(upsStore.currentPage + 1, 50, true)
          .then(() => {
            const newUps = upsStore.list.filter(u => 
              !allUps.value.find(existing => existing.id === u.id)
            );
            allUps.value.push(...newUps);
            upsPage.value++;
            hasMoreUps.value = upsStore.currentPage < upsStore.totalPages;
          })
      );
    }
    
    await Promise.all(promises);
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
    if (hasMoreRooms.value || hasMoreServers.value || hasMoreUps.value) {
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
