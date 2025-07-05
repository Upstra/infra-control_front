<template>
  <BaseWidget
    :config="config"
    @remove="emit('close')"
    @settings="emit('settings')"
  >
    <div class="p-4">
      <div v-if="loading" class="flex justify-center items-center h-48">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="text-center text-red-500 dark:text-red-400 p-4"
      >
        {{ t('dashboard.widgets.userPresence.error') }}
      </div>

      <div v-else>
        <div
          class="flex items-center justify-around mb-4 pb-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span
                class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                >{{ summary.online }}</span
              >
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.userPresence.online') }}
            </p>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span
                class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                >{{ summary.idle }}</span
              >
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.userPresence.idle') }}
            </p>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <div class="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
              <span
                class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                >{{ summary.offline }}</span
              >
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.userPresence.offline') }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div v-if="onlineUsers.length > 0">
            <h4
              class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              {{ t('dashboard.widgets.userPresence.currentlyOnline') }}
            </h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="user in onlineUsers"
                :key="user.id"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div class="relative">
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.name"
                    class="h-8 w-8 rounded-full"
                  />
                  <div
                    v-else
                    class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div
                    :class="[
                      'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
                      user.status === 'active'
                        ? 'bg-green-500'
                        : 'bg-yellow-500',
                    ]"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                  >
                    {{ user.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {{ user.location }}
                  </p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-500">
                  {{ formatTime(user.lastSeen) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="recentlyOffline.length > 0 && showRecentlyOffline">
            <h4
              class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              {{ t('dashboard.widgets.userPresence.recentlyOffline') }}
            </h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div
                v-for="user in recentlyOffline"
                :key="user.id"
                class="flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span>{{ user.name }}</span>
                <span class="text-xs">{{ formatTime(user.lastSeen) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseWidget from './BaseWidget.vue';
import { useDashboardStore } from '../../store';
import type { Widget, OnlineUser } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  config: Widget;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  settings: [];
}>();

const { t } = useI18n();
const dashboardStore = useDashboardStore();

const onlineUsers = ref<OnlineUser[]>([]);
const recentlyOffline = ref<
  Array<{ id: string; name: string; lastSeen: string }>
>([]);
const summary = ref({ online: 0, idle: 0, offline: 0 });
const loading = ref(true);
const error = ref(false);
const showRecentlyOffline = computed(
  () => props.config.settings?.showRecentlyOffline !== false,
);

let refreshInterval: number | null = null;

const fetchUserPresence = async () => {
  try {
    error.value = false;
    const response = await dashboardStore.getUserPresence();
    onlineUsers.value = response.onlineUsers;
    recentlyOffline.value = response.recentlyOffline;
    summary.value = response.summary;
  } catch (err) {
    console.error('Error fetching user presence:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatTime = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

onMounted(() => {
  fetchUserPresence();

  if (props.config.refreshInterval) {
    refreshInterval = window.setInterval(() => {
      fetchUserPresence();
    }, props.config.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
