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
  CommandLineIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import type { Server } from '../types';
import { usePowerState } from '@/services/powerStateManager';

interface Props {
  server: Server | null;
  loading: boolean;
  liveStatus: 'up' | 'down' | 'checking' | null;
  isPerformingAction: boolean;
  powerState?: string | null;
  checkingPowerState?: boolean;
  canDelete?: boolean;
}

interface Emits {
  (e: 'server-action', action: 'start' | 'shutdown' | 'reboot'): void;
  (e: 'ping'): void;
  (e: 'edit'): void;
  (e: 'open-terminal'): void;
  (e: 'delete'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const router = useRouter();
const { t } = useI18n();

const { isInOperation, operationType } = usePowerState(
  props.server?.id || '',
  'server',
);
</script>

<template>
  <div
    class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10 dark:bg-neutral-800 dark:border-neutral-700"
  >
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="router.back()"
            class="flex items-center px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-2 dark:text-slate-400" />
            {{ t('common.back') }}
          </button>

          <div class="flex items-center space-x-3" v-if="server">
            <div class="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
              <ServerIcon class="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ server.name }}
              </h1>
              <p class="text-sm text-slate-600 dark:text-neutral-400">
                {{ server.ip }} • {{ server.type
                }}<span v-if="server.vmwareHostMoid">
                  • {{ server.vmwareHostMoid }}</span
                >
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2" v-if="server">
          <div
            v-if="
              (server.type === 'vcenter' || server.type === 'esxi') &&
              server.ilo &&
              powerState
            "
            class="flex items-center space-x-2"
          >
            <div
              v-if="checkingPowerState"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"
            ></div>
            <span
              v-else-if="isInOperation"
              :class="[
                'flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border',
                'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
              ]"
            >
              <svg
                class="animate-spin h-3 w-3 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{
                operationType === 'starting'
                  ? t('servers.starting')
                  : t('servers.stopping')
              }}</span>
            </span>
            <span
              v-else
              :class="[
                'flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border',
                powerState === 'On' || powerState === 'poweredOn'
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
              ]"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  powerState === 'On' || powerState === 'poweredOn'
                    ? 'bg-emerald-500 dark:bg-emerald-600'
                    : 'bg-gray-500 dark:bg-gray-600',
                ]"
              ></div>
              <span>{{
                powerState === 'On' || powerState === 'poweredOn'
                  ? t('servers.online')
                  : t('servers.offline')
              }}</span>
            </span>
          </div>

          <div
            v-else-if="liveStatus && liveStatus !== 'checking'"
            class="flex items-center space-x-2"
          >
            <span
              :class="[
                'flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border',
                liveStatus === 'up'
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700'
                  : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700',
              ]"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  liveStatus === 'up'
                    ? 'bg-emerald-500 dark:bg-emerald-600'
                    : 'bg-red-500 dark:bg-red-600',
                ]"
              ></div>
              <span>{{
                liveStatus === 'up' ? t('servers.online') : t('servers.offline')
              }}</span>
            </span>
          </div>

          <div
            v-else-if="liveStatus === 'checking' || checkingPowerState"
            class="flex items-center space-x-2"
          >
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"
            ></div>
            <span class="text-xs text-slate-600 dark:text-slate-400"
              >{{ t('common.checking') }}...</span
            >
          </div>
        </div>
      </div>
    </div>

    <div v-if="server" class="max-w-7xl mx-auto px-6 pb-4">
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 dark:bg-neutral-800 dark:border-neutral-700"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button
              v-if="
                server.type === 'esxi' &&
                server.ilo &&
                (!powerState ||
                  powerState === 'Off' ||
                  powerState === 'unknown' ||
                  powerState === 'Error')
              "
              @click="$emit('server-action', 'start')"
              :disabled="
                isPerformingAction || checkingPowerState || isInOperation
              "
              class="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              <PlayIcon class="h-4 w-4 mr-2" />
              {{ t('servers.start') }}
            </button>

            <button
              v-if="
                server.type === 'esxi' &&
                server.ilo &&
                (powerState === 'On' || powerState === 'poweredOn')
              "
              @click="$emit('server-action', 'shutdown')"
              :disabled="
                isPerformingAction || checkingPowerState || isInOperation
              "
              class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
            >
              <StopIcon class="h-4 w-4 mr-2" />
              {{ t('servers.shutdown') }}
            </button>

            <button
              v-if="
                server.type === 'esxi' &&
                server.ilo &&
                (powerState === 'On' || powerState === 'poweredOn')
              "
              @click="$emit('server-action', 'reboot')"
              :disabled="
                isPerformingAction || checkingPowerState || isInOperation
              "
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" />
              {{ t('servers.reboot') }}
            </button>

            <button
              @click="$emit('ping')"
              :disabled="liveStatus === 'checking'"
              class="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-800"
            >
              <SignalIcon class="h-4 w-4 mr-2" />
              {{ t('servers.ping') }}
            </button>

            <button
              @click="$emit('open-terminal')"
              class="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <CommandLineIcon class="h-4 w-4 mr-2" />
              Terminal
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="$emit('edit')"
              class="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PencilIcon class="h-4 w-4 mr-2" />
              {{ t('servers.edit') }}
            </button>

            <button
              v-if="canDelete"
              @click="$emit('delete')"
              class="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon class="h-4 w-4 mr-2" />
              {{ t('servers.delete') }}
            </button>
          </div>
        </div>

        <div
          v-if="isPerformingAction"
          class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900 dark:border-blue-800"
        >
          <div class="flex items-center space-x-3">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"
            ></div>
            <span class="text-sm text-blue-800 dark:text-blue-300">{{
              t('servers.action_in_progress')
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
