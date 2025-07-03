<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { VueFlow, useVueFlow, Panel, MarkerType } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import type { Node, Edge } from '@vue-flow/core';
import {
  ArrowLeftIcon,
  ServerIcon,
  BoltIcon,
  ChartBarIcon,
  EyeIcon,
  MapIcon,
  Squares2X2Icon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline';
import type { Server } from '../../servers/types';
import type { Ups } from '../../ups/types';
import ServerCard from '../../servers/components/ServerCard.vue';
import UpsCard from '../../ups/components/UpsCard.vue';
import { useRoomStore } from '../store';
import { fetchServers } from '../../servers/api';
import { upsApi } from '../../ups/api';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const roomId = route.params.id as string;
const roomStore = useRoomStore();
const { current: room, loading } = storeToRefs(roomStore);
const { fetchRoomById } = roomStore;
const servers = ref<Server[]>([]);
const upsList = ref<Ups[]>([]);
const loadingInfra = ref(false);
const activeView = ref<'cards' | 'flow'>('cards');

const { fitView } = useVueFlow();

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

const fetchRoomInfrastructure = async () => {
  loadingInfra.value = true;
  try {
    const [serversResponse, upsResponse] = await Promise.all([
      fetchServers(),
      upsApi.getAll(),
    ]);

    servers.value = serversResponse.data.items.filter(
      (server: Server) => server.roomId === roomId,
    );
    upsList.value = upsResponse.filter((ups) => ups.roomId === roomId);

    generateFlowData();
  } catch (error) {
    console.error('Failed to fetch room infrastructure:', error);
  } finally {
    loadingInfra.value = false;
  }
};

const generateFlowData = () => {
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];

  let xPos = 100;
  let yPos = 100;

  upsList.value.forEach((ups, index) => {
    flowNodes.push({
      id: `ups-${ups.id}`,
      type: 'default',
      position: { x: xPos + index * 200, y: yPos },
      data: {
        label: ups.name,
        type: 'ups',
        details: ups,
      },
      style: {
        background: '#fbbf24',
        color: '#1f2937',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
      },
    });

    const connectedServers = servers.value.filter(
      (server) => server.upsId === ups.id,
    );
    connectedServers.forEach((server, serverIndex) => {
      const serverNodeId = `server-${server.id}`;
      flowNodes.push({
        id: serverNodeId,
        type: 'default',
        position: {
          x: xPos + index * 200 - 50 + serverIndex * 100,
          y: yPos + 150,
        },
        data: {
          label: server.name,
          type: 'server',
          details: server,
        },
        style: {
          background: server.state === 'active' ? '#10b981' : '#6b7280',
          color: 'white',
          border: '2px solid #047857',
          borderRadius: '12px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      });

      flowEdges.push({
        id: `ups-${ups.id}-server-${server.id}`,
        source: `ups-${ups.id}`,
        target: serverNodeId,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#f59e0b',
        },
      });
    });
  });

  const standaloneServers = servers.value.filter((server) => !server.upsId);
  standaloneServers.forEach((server, index) => {
    flowNodes.push({
      id: `server-${server.id}`,
      type: 'default',
      position: { x: 100 + index * 150, y: 350 },
      data: {
        label: server.name,
        type: 'server',
        details: server,
      },
      style: {
        background: server.state === 'active' ? '#10b981' : '#6b7280',
        color: 'white',
        border: '2px solid #047857',
        borderRadius: '12px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    });
  });

  nodes.value = flowNodes;
  edges.value = flowEdges;

  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 100);
};

const infraStats = computed(() => ({
  totalServers: servers.value.length,
  activeServers: servers.value.filter((s) => s.state === 'active').length,
  totalUps: upsList.value.length,
  upsConnected: servers.value.filter((s) => s.upsId).length,
}));

onMounted(() => {
  fetchRoomById(roomId);
  fetchRoomInfrastructure();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800">
    <div class="bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="router.back()"
              class="flex items-center px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
            >
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              {{ t('common.back') }}
            </button>

            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BuildingOffice2Icon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div v-if="room">
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                  {{ room.name }}
                </h1>
                <p class="text-sm text-slate-600 dark:text-slate-400">Room ID: {{ room.id }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2 bg-slate-100 dark:bg-neutral-700 rounded-lg p-1">
            <button
              @click="activeView = 'cards'"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2',
                activeView === 'cards'
                  ? 'bg-white dark:bg-neutral-600 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
              ]"
            >
              <Squares2X2Icon class="h-4 w-4" />
              <span>{{ t('rooms.detail.cards_view') }}</span>
            </button>
            <button
              @click="activeView = 'flow'"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2',
                activeView === 'flow'
                  ? 'bg-white dark:bg-neutral-600 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
              ]"
            >
              <MapIcon class="h-4 w-4" />
              <span>{{ t('rooms.detail.flow_view') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="loading || loadingInfra"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center space-y-4">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="text-slate-600 dark:text-slate-400">{{ t('rooms.loading') }}</p>
      </div>
    </div>

    <div v-else-if="room" class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('rooms.detail.total_servers') }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ infraStats.totalServers }}
              </p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ServerIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('rooms.detail.active_servers') }}
              </p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ infraStats.activeServers }}
              </p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <ChartBarIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('rooms.detail.ups_units') }}
              </p>
              <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {{ infraStats.totalUps }}
              </p>
            </div>
            <div class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <BoltIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('rooms.detail.ups_protected') }}
              </p>
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ infraStats.upsConnected }}
              </p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <EyeIcon class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="activeView === 'flow'"
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 overflow-hidden"
      >
        <div class="h-[600px] relative">
          <VueFlow
            :nodes="nodes"
            :edges="edges"
            :fit-view-on-init="true"
            class="vue-flow"
          >
            <Background />
            <MiniMap />
            <Controls />
            <Panel
              :position="'top-right'"
              class="bg-white dark:bg-neutral-700 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-neutral-600"
            >
              <div class="space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <div class="w-4 h-4 bg-amber-500 rounded"></div>
                  <span class="text-slate-700 dark:text-slate-300">{{ t('rooms.detail.flow_legend.ups_units') }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-4 h-4 bg-green-500 rounded"></div>
                  <span class="text-slate-700 dark:text-slate-300">{{
                    t('rooms.detail.flow_legend.active_servers')
                  }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-4 h-4 bg-gray-500 rounded"></div>
                  <span class="text-slate-700 dark:text-slate-300">{{
                    t('rooms.detail.flow_legend.inactive_servers')
                  }}</span>
                </div>
              </div>
            </Panel>
          </VueFlow>
        </div>
      </div>

      <div v-else class="space-y-8">
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2
              class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3"
            >
              <ServerIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span>{{ t('rooms.detail.servers_section') }}</span>
              <span class="text-sm font-normal text-slate-500 dark:text-slate-400"
                >({{ servers.length }})</span
              >
            </h2>
          </div>

          <div
            v-if="servers.length"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="server in servers"
              :key="server.id"
              @click="() => router.push(`/servers/${server.id}`)"
              class="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            >
              <ServerCard :server="server" />
            </div>
          </div>
          <div
            v-else
            class="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-12 text-center"
          >
            <ServerIcon class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p class="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
              {{ t('rooms.detail.no_servers_found') }}
            </p>
            <p class="text-slate-500 dark:text-slate-400">
              {{ t('rooms.detail.no_servers_assigned') }}
            </p>
          </div>
        </section>

        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2
              class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3"
            >
              <BoltIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span>{{ t('rooms.detail.ups_section') }}</span>
              <span class="text-sm font-normal text-slate-500 dark:text-slate-400"
                >({{ upsList.length }})</span
              >
            </h2>
          </div>

          <div
            v-if="upsList.length"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            <UpsCard
              v-for="ups in upsList"
              :key="ups.id"
              :ups="ups"
              class="hover:scale-[1.02] transition-transform duration-200"
            />
          </div>
          <div
            v-else
            class="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-12 text-center"
          >
            <BoltIcon class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p class="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
              {{ t('rooms.detail.no_ups_found') }}
            </p>
            <p class="text-slate-500 dark:text-slate-400">
              {{ t('rooms.detail.no_ups_assigned') }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/controls/dist/style.css';
</style>
