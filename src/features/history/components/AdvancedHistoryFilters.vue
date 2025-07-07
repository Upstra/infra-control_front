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
const showAdvanced = ref(false);

const actionGroups = computed(() => [
  {
    label: t('history.filters.action_groups.create'),
    actions: ['CREATE', 'REGISTER'],
    color: 'green',
  },
  {
    label: t('history.filters.action_groups.update'),
    actions: ['UPDATE', 'ROLE_ASSIGNED', 'ROLE_REMOVED'],
    color: 'blue',
  },
  {
    label: t('history.filters.action_groups.delete'),
    actions: ['DELETE'],
    color: 'red',
  },
  {
    label: t('history.filters.action_groups.auth'),
    actions: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', '2FA_ENABLED', '2FA_DISABLED'],
    color: 'purple',
  },
  {
    label: t('history.filters.action_groups.server'),
    actions: ['START', 'RESTART', 'SHUTDOWN'],
    color: 'orange',
  },
]);

const selectedActions = ref<Set<string>>(new Set());
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
  if (localFilters.value.userId) count++;
  if (selectedActions.value.size > 0) count++;
  return count;
});

const applyDatePreset = (preset: any) => {
  const { from, to } = preset.value();
  localFilters.value.from = from;
  localFilters.value.to = to;
};

const toggleAction = (action: string) => {
  if (selectedActions.value.has(action)) {
    selectedActions.value.delete(action);
  } else {
    selectedActions.value.add(action);
  }
  updateActionFilter();
};

const toggleActionGroup = (group: any) => {
  const allSelected = group.actions.every((action: string) =>
    selectedActions.value.has(action),
  );

  if (allSelected) {
    group.actions.forEach((action: string) =>
      selectedActions.value.delete(action),
    );
  } else {
    group.actions.forEach((action: string) =>
      selectedActions.value.add(action),
    );
  }
  updateActionFilter();
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

const updateActionFilter = () => {
  if (selectedActions.value.size === 0) {
    localFilters.value.action = undefined;
  } else {
    // Support multiple actions as array
    localFilters.value.action = Array.from(selectedActions.value) as any;
  }
};

const clearFilters = () => {
  localFilters.value = {
    entity: '',
    action: '',
    from: '',
    to: '',
    userId: '',
  };
  selectedActions.value.clear();
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
            @click="showAdvanced = !showAdvanced"
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {{ showAdvanced ? 'Simple' : 'Advanced' }} filters
          </button>
          <button
            v-if="activeFiltersCount > 0"
            @click="clearFilters"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Clear all
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            User
          </label>
          <input
            v-model="localFilters.userId"
            type="text"
            placeholder="User ID or email"
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

      <div
        v-if="showAdvanced"
        class="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Action Types
        </h4>
        <div class="space-y-3">
          <div
            v-for="group in actionGroups"
            :key="group.label"
            class="space-y-2"
          >
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="group.actions.every((a) => selectedActions.has(a))"
                :indeterminate="
                  group.actions.some((a) => selectedActions.has(a)) &&
                  !group.actions.every((a) => selectedActions.has(a))
                "
                @change="toggleActionGroup(group)"
                class="rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ group.label }}
              </label>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 ml-6">
              <label
                v-for="action in group.actions"
                :key="action"
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="selectedActions.has(action)"
                  @change="toggleAction(action)"
                  class="rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <span>{{ action }}</span>
              </label>
            </div>
          </div>
        </div>
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
