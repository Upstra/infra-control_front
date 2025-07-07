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
        {{ t('dashboard.widgets.activityFeed.error') }}
      </div>

      <div
        v-else-if="activities.length === 0"
        class="text-center text-gray-500 dark:text-gray-400 p-8"
      >
        {{ t('dashboard.widgets.activityFeed.noActivity') }}
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex-shrink-0">
            <img
              v-if="activity.actor.avatar"
              :src="activity.actor.avatar"
              :alt="activity.actor.name"
              class="h-8 w-8 rounded-full"
            />
            <div
              v-else
              class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium"
            >
              {{ activity.actor.name.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 dark:text-gray-100">
              <span class="font-medium">{{ activity.actor.name }}</span>
              {{ ' ' }}
              <span class="text-gray-600 dark:text-gray-400">{{
                activity.description
              }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ formatTime(activity.timestamp) }}
            </p>
          </div>

          <div class="flex-shrink-0">
            <Icon
              :name="getActivityIcon(activity.type)"
              :class="getActivityColor(activity.type)"
            />
          </div>
        </div>

        <div v-if="hasMore" class="text-center pt-2">
          <button
            @click="loadMore"
            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ t('dashboard.widgets.activityFeed.loadMore') }}
          </button>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseWidget from './BaseWidget.vue';
import Icon from '@/shared/components/Icon.vue';
import { useDashboardStore } from '../../store';
import type { Widget, Activity } from '../../types';
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

const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref(false);
const page = ref(1);
const hasMore = ref(true);
const limit = 10;

let refreshInterval: number | null = null;

const fetchActivities = async (append = false) => {
  try {
    loading.value = true;
    error.value = false;
    const response = await dashboardStore.getActivityFeed(page.value, limit);

    if (append) {
      activities.value = [...activities.value, ...response.activities];
    } else {
      activities.value = response.activities;
    }

    hasMore.value = activities.value.length < response.pagination.total;
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  page.value += 1;
  await fetchActivities(true);
};

const formatTime = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    server_created: 'server',
    server_deleted: 'server',
    server_updated: 'server',
    user_created: 'user-plus',
    user_deleted: 'user-minus',
    user_login: 'log-in',
    ups_alert: 'alert-triangle',
    room_created: 'home',
    vm_created: 'box',
    vm_deleted: 'box',
  };
  return icons[type] || 'activity';
};

const getActivityColor = (type: string) => {
  if (type.includes('delete')) return 'text-red-500';
  if (type.includes('alert')) return 'text-yellow-500';
  if (type.includes('create')) return 'text-green-500';
  return 'text-blue-500';
};

onMounted(() => {
  fetchActivities();

  if (props.config.refreshInterval) {
    refreshInterval = window.setInterval(() => {
      fetchActivities();
    }, props.config.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
