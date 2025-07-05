<template>
  <div class="flex space-x-3">
    <div
      :class="[
        'flex-shrink-0 w-2 h-2 rounded-full mt-2',
        activity.type === 'login'
          ? 'bg-green-500'
          : activity.type === 'logout'
            ? 'bg-gray-400'
            : activity.type === 'password_change'
              ? 'bg-yellow-500'
              : activity.type === 'profile_update'
                ? 'bg-blue-500'
                : 'bg-red-500',
      ]"
    />
    <div class="flex-1 space-y-1">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ activity.title }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ formattedTime }}
        </p>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        {{ activity.description }}
      </p>
      <div v-if="activity.metadata" class="flex items-center space-x-4 mt-1">
        <span
          v-if="activity.metadata.ip"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          IP: {{ activity.metadata.ip }}
        </span>
        <span
          v-if="activity.metadata.browser"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ activity.metadata.browser }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useI18n } from 'vue-i18n';

interface ActivityMetadata {
  ip?: string;
  browser?: string;
  location?: string;
}

interface Activity {
  id: string;
  type:
    | 'login'
    | 'logout'
    | 'password_change'
    | 'profile_update'
    | 'failed_login';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: ActivityMetadata;
}

interface Props {
  activity: Activity;
}

const props = defineProps<Props>();

const { locale } = useI18n();

const formattedTime = computed(() => {
  const dateLocale = locale.value === 'fr' ? fr : enUS;
  return formatDistanceToNow(props.activity.timestamp, {
    addSuffix: true,
    locale: dateLocale,
  });
});
</script>
