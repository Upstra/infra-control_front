<template>
  <ul class="space-y-1">
    <li v-for="room in rooms" :key="room.id">
      <div 
        class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
        @click="props.isSidebarOpen ? toggleExpand(room.id) : null"
      >
        <div
          v-if="props.isSidebarOpen"
          class="flex-shrink-0"
        >
          <ChevronDown v-if="isExpanded(room.id)" class="w-4 h-4 text-white/60" />
          <ChevronRight v-else class="w-4 h-4 text-white/60" />
        </div>
        <Building class="w-4 h-4 text-white/80 flex-shrink-0" />
        <span v-if="props.isSidebarOpen" class="text-sm text-white/90 truncate font-medium">
          {{ room.name }}
        </span>
      </div>

      <transition name="fade">
        <ul v-if="isExpanded(room.id)" class="ml-4 mt-1 space-y-0.5">
          <li v-for="server in room.servers" :key="server.id">
            <div 
              class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
              @click="props.isSidebarOpen ? toggleExpand(server.id) : null"
            >
              <div
                v-if="props.isSidebarOpen"
                class="flex-shrink-0"
              >
                <ChevronDown v-if="isExpanded(server.id)" class="w-3 h-3 text-white/50" />
                <ChevronRight v-else class="w-3 h-3 text-white/50" />
              </div>
              <Server class="w-4 h-4 text-white/70 flex-shrink-0" />
              <span
                v-if="props.isSidebarOpen"
                class="text-xs text-white/80 truncate"
              >
                {{ server.name }}
              </span>
            </div>

            <transition name="fade">
              <ul v-if="isExpanded(server.id)" class="ml-6 mt-1 space-y-0.5">
                <li v-for="vm in server.vms" :key="vm.name">
                  <div class="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-white/5 transition-colors">
                    <Minus v-if="props.isSidebarOpen" class="w-2 h-2 text-white/40 flex-shrink-0" />
                    <Box class="w-3 h-3 text-white/60 flex-shrink-0" />
                    <span
                      v-if="props.isSidebarOpen"
                      class="text-xs text-white/70 truncate"
                    >
                      {{ vm.name }}
                    </span>
                  </div>
                </li>
              </ul>
            </transition>
          </li>
          <li v-for="ups in room.ups" :key="ups.name">
            <div class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors">
              <Minus v-if="props.isSidebarOpen" class="w-3 h-3 text-white/50 flex-shrink-0" />
              <Plug class="w-4 h-4 text-white/70 flex-shrink-0" />
              <span
                v-if="props.isSidebarOpen"
                class="text-xs text-white/80 truncate"
              >
                {{ ups.name }}
              </span>
            </div>
          </li>
        </ul>
      </transition>
    </li>
  </ul>
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
import { ref } from 'vue';

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
  rooms: Object,
});

let rooms = [
  {
    id: '1',
    name: 'Salle 1',
    servers: [
      {
        id: '11',
        name: 'Serveur 1',
        vms: [{ name: 'VM 1' }, { name: 'VM 2' }],
      },
    ],
    ups: [{ name: 'Onduleur' }],
  },
  {
    id: '2',
    name: 'Salle 2',
    servers: [
      {
        id: '21',
        name: 'Serveur 1',
        vms: [{ name: 'VM 1' }, { name: 'VM 2' }],
      },
      {
        id: '22',
        name: 'Serveur 2',
        vms: [{ name: 'VM' }],
      },
      {
        id: '23',
        name: 'Serveur Site Web',
        vms: [
          { name: 'VM BDD' },
          { name: 'Docker' },
          { name: 'VM Frontend' },
          { name: 'VM Backend' },
        ],
      },
      {
        id: '24',
        name: 'Serveur 3',
        vms: [
          { name: 'VM 1' },
          { name: 'VM 2' },
          { name: 'VM 3' },
          { name: 'VM 4' },
        ],
      },
    ],
    ups: [{ name: 'Onduleur' }],
  },
  {
    id: '3',
    name: 'Salle 3',
    servers: [
      {
        id: '31',
        name: 'Serveur avec plein de VMs',
        vms: [
          { name: 'VM 1' },
          { name: 'VM 2' },
          { name: 'VM 3' },
          { name: 'VM 4' },
          { name: 'VM 5' },
          { name: 'VM 6' },
          { name: 'VM 7' },
          { name: 'VM 8' },
          { name: 'VM 9' },
          { name: 'VM 10' },
          { name: 'VM 11' },
          { name: 'VM 12' },
          { name: 'VM 13' },
          { name: 'VM 14' },
          { name: 'VM 15' },
          { name: 'VM 16' },
          { name: 'VM 17' },
          { name: 'VM 18' },
          { name: 'VM 19' },
          { name: 'VM 20' },
          { name: 'VM 21' },
          { name: 'VM 22' },
          { name: 'VM 23' },
          { name: 'VM 24' },
          { name: 'VM 25' },
          { name: 'VM 26' },
          { name: 'VM 27' },
          { name: 'VM 28' },
          { name: 'VM 29' },
          { name: 'VM 30' },
          { name: 'VM 31' },
          { name: 'VM 32' },
          { name: 'VM 33' },
          { name: 'VM 34' },
          { name: 'VM 35' },
          { name: 'VM 36' },
          { name: 'VM 37' },
          { name: 'VM 38' },
          { name: 'VM 39' },
          { name: 'VM 40' },
        ],
      },
    ],
    ups: [{ name: 'Onduleur 1' }, { name: 'Onduleur 2' }],
  },
  {
    id: '4',
    name: 'Salle 4',
    servers: [
      {
        id: '41',
        name: 'Serveur',
        vms: [{ name: 'VM ' }],
      },
    ],
    ups: [{ name: 'Onduleur' }],
  },
];

const expandedSet = ref(new Set<string>());

const isExpanded = (uuid: string) => expandedSet.value.has(uuid);

const toggleExpand = (uuid: string) => {
  if (expandedSet.value.has(uuid)) {
    expandedSet.value.delete(uuid);
  } else {
    expandedSet.value.add(uuid);
  }
};
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
</style>
