<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeftIcon,
  ServerIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  SignalIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline';
import type { Server } from '../types';

interface Props {
  server: Server | null;
  loading: boolean;
  liveStatus: 'up' | 'down' | 'checking' | null;
  isPerformingAction: boolean;
}

interface Emits {
  (e: 'server-action', action: 'start' | 'shutdown' | 'reboot'): void;
  (e: 'ping'): void;
  (e: 'edit'): void;
}

defineProps<Props>();
defineEmits<Emits>();

const router = useRouter();
const { t } = useI18n();

const getStatusColor = (state: string) => {
  switch (state) {
    case 'active':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'inactive':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};
</script>

<template>
  <div class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="router.back()"
            class="flex items-center px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            {{ t('common.back') }}
          </button>

          <div class="flex items-center space-x-3" v-if="server">
            <div class="p-2 bg-blue-100 rounded-lg">
              <ServerIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900">
                {{ server.name }}
              </h1>
              <p class="text-sm text-slate-600">
                {{ server.ip }} • {{ server.type }} • ID: {{ server.id }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2" v-if="server">
          <span
            :class="[
              'px-3 py-1 text-xs font-semibold rounded-full border flex items-center space-x-1',
              getStatusColor(server.state),
            ]"
          >
            <div
              :class="[
                'w-2 h-2 rounded-full',
                server.state === 'active' ? 'bg-emerald-500' : 'bg-red-500',
              ]"
            ></div>
            <span>{{
              server.state === 'active'
                ? t('servers.active')
                : t('servers.inactive')
            }}</span>
          </span>

          <div v-if="liveStatus" class="flex items-center space-x-2">
            <div
              v-if="liveStatus === 'checking'"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
            ></div>
            <span
              v-else
              :class="[
                'flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full',
                liveStatus === 'up'
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-red-700 bg-red-100',
              ]"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  liveStatus === 'up' ? 'bg-emerald-500' : 'bg-red-500',
                ]"
              ></div>
              <span>{{
                liveStatus === 'up'
                  ? t('servers.online')
                  : t('servers.offline')
              }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="server" class="max-w-7xl mx-auto px-6 pb-4">
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button
              @click="$emit('server-action', 'start')"
              :disabled="isPerformingAction"
              class="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon class="h-4 w-4 mr-2" />
              {{ t('servers.start') }}
            </button>

            <button
              @click="$emit('server-action', 'shutdown')"
              :disabled="isPerformingAction"
              class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon class="h-4 w-4 mr-2" />
              {{ t('servers.shutdown') }}
            </button>

            <button
              @click="$emit('server-action', 'reboot')"
              :disabled="isPerformingAction"
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" />
              {{ t('servers.reboot') }}
            </button>

            <button
              @click="$emit('ping')"
              :disabled="liveStatus === 'checking'"
              class="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SignalIcon class="h-4 w-4 mr-2" />
              {{ t('servers.ping') }}
            </button>
          </div>

          <button
            @click="$emit('edit')"
            class="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            {{ t('servers.edit') }}
          </button>
        </div>

        <div
          v-if="isPerformingAction"
          class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div class="flex items-center space-x-3">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
            ></div>
            <span class="text-sm text-blue-800">{{
              t('servers.action_in_progress')
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>