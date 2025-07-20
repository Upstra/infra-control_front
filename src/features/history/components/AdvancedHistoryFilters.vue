<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { HistoryFilters } from '../types';
import { useHistoryStore } from '../store';

const props = defineProps<{
  modelValue: HistoryFilters;
  availableEntityTypes?: string[];
}>();

const { t } = useI18n();
const historyStore = useHistoryStore();

const emit = defineEmits<{
  'update:modelValue': [value: HistoryFilters];
  apply: [];
}>();

const localFilters = ref<HistoryFilters>({ ...props.modelValue });

const datePresets = computed(() => [
  {
    label: t('history.filters.date_presets.last_24h'),
    value: () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yesterday.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0],
      };
    },
  },
  {
    label: t('history.filters.date_presets.last_7d'),
    value: () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: weekAgo.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0],
      };
    },
  },
  {
    label: t('history.filters.date_presets.last_30d'),
    value: () => {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        from: monthAgo.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0],
      };
    },
  },
  {
    label: t('history.filters.date_presets.this_month'),
    value: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: firstDay.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0],
      };
    },
  },
]);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (localFilters.value.entity) count++;
  if (localFilters.value.action) count++;
  if (localFilters.value.from || localFilters.value.to) count++;
  return count;
});

const applyDatePreset = (preset: any) => {
  const { from, to } = preset.value();
  localFilters.value.from = from;
  localFilters.value.to = to;
};

const availableEntities = computed(() => {
  return historyStore.availableEntityTypes || props.availableEntityTypes || [];
});

onMounted(async () => {
  if (
    !historyStore.availableEntityTypes ||
    historyStore.availableEntityTypes.length === 0
  ) {
    await historyStore.getAvailableEntityTypes();
  }
});

const clearFilters = () => {
  localFilters.value = {
    entity: '',
    action: '',
    from: '',
    to: '',
  };
  emit('update:modelValue', localFilters.value);
  emit('apply');
};

const applyFilters = () => {
  emit('update:modelValue', localFilters.value);
  emit('apply');
};

watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = { ...newValue };
  },
  { deep: true },
);
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          <span
            v-if="activeFiltersCount > 0"
            class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
          >
            {{ activeFiltersCount }} active
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="activeFiltersCount > 0"
            @click="clearFilters"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Clear all
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Entity Type
          </label>
          <select
            v-model="localFilters.entity"
            class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{{ t('history.filters.all_entities') }}</option>
            <option v-for="type in availableEntities" :key="type" :value="type">
              {{ t(`history.entities.${type}`, type) }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date From
          </label>
          <input
            v-model="localFilters.from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date To
          </label>
          <input
            v-model="localFilters.to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div class="flex gap-2 mt-3">
        <button
          v-for="preset in datePresets"
          :key="preset.label"
          @click="applyDatePreset(preset)"
          class="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
        >
          {{ preset.label }}
        </button>
      </div>

      <div class="flex justify-end mt-6">
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>
