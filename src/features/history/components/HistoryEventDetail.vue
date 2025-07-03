<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { HistoryEvent } from '../types';
import { actionStyles } from '../types';

interface Props {
  event: HistoryEvent;
}

const props = defineProps<Props>();
const { t } = useI18n();

const actionStyle = computed(() => {
  return actionStyles[props.event.action] || { color: 'text-gray-600', icon: '📝' };
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatJson = (data: any) => {
  if (!data) return null;
  return JSON.stringify(data, null, 2);
};

const hasChanges = computed(() => {
  return props.event.oldValue || props.event.newValue;
});

const getChangedFields = computed(() => {
  if (!props.event.oldValue || !props.event.newValue) return [];
  
  const changes: Array<{ field: string; old: any; new: any }> = [];
  const allKeys = new Set([
    ...Object.keys(props.event.oldValue || {}),
    ...Object.keys(props.event.newValue || {})
  ]);
  
  allKeys.forEach(key => {
    const oldVal = props.event.oldValue?.[key];
    const newVal = props.event.newValue?.[key];
    
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old: oldVal, new: newVal });
    }
  });
  
  return changes;
});
</script>

<template>
  <div class="space-y-4 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
    <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-neutral-700">
      <span class="text-2xl">{{ actionStyle.icon }}</span>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ event.entity }} - {{ event.action }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ formatDate(event.createdAt) }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('administration.history_details.general_info') }}
        </h4>
        <dl class="space-y-1 text-sm">
          <div class="flex gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400">ID:</dt>
            <dd class="text-gray-900 dark:text-white">{{ event.entityId }}</dd>
          </div>
          <div v-if="event.userId" class="flex gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400">{{ t('administration.history_details.headers.user') }}:</dt>
            <dd class="text-gray-900 dark:text-white">{{ event.userId }}</dd>
          </div>
          <div v-if="event.ipAddress" class="flex gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400">IP:</dt>
            <dd class="text-gray-900 dark:text-white">{{ event.ipAddress }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="event.metadata">
        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('administration.history_details.metadata') }}
        </h4>
        <dl class="space-y-1 text-sm">
          <div v-for="(value, key) in event.metadata" :key="key" class="flex gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400">{{ key }}:</dt>
            <dd class="text-gray-900 dark:text-white">
              <span v-if="typeof value === 'boolean'">
                <span v-if="value" class="text-green-600">✓</span>
                <span v-else class="text-red-600">✗</span>
              </span>
              <span v-else>{{ value }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <div v-if="hasChanges" class="space-y-3">
      <h4 class="font-medium text-gray-700 dark:text-gray-300">
        {{ t('administration.history_details.changes') }}
      </h4>
      
      <div v-for="change in getChangedFields" :key="change.field" 
           class="bg-gray-50 dark:bg-neutral-900 rounded p-3 space-y-2">
        <h5 class="font-medium text-gray-800 dark:text-gray-200">{{ change.field }}</h5>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div v-if="change.old !== undefined" class="space-y-1">
            <p class="text-xs font-medium text-red-600 dark:text-red-400">
              {{ t('administration.history_details.old_value') }}
            </p>
            <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
              <pre v-if="typeof change.old === 'object'" class="text-xs overflow-x-auto text-gray-700 dark:text-gray-300">{{ formatJson(change.old) }}</pre>
              <span v-else class="text-gray-700 dark:text-gray-300">{{ change.old || '-' }}</span>
            </div>
          </div>
          
          <div v-if="change.new !== undefined" class="space-y-1">
            <p class="text-xs font-medium text-green-600 dark:text-green-400">
              {{ t('administration.history_details.new_value') }}
            </p>
            <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
              <pre v-if="typeof change.new === 'object'" class="text-xs overflow-x-auto text-gray-700 dark:text-gray-300">{{ formatJson(change.new) }}</pre>
              <span v-else class="text-gray-700 dark:text-gray-300">{{ change.new || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="event.userAgent" class="pt-3 border-t border-gray-200 dark:border-neutral-700">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        <span class="font-medium">User Agent:</span> {{ event.userAgent }}
      </p>
    </div>
  </div>
</template>