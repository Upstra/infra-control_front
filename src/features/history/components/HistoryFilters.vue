<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
    :class="isExpanded ? '' : 'hover:shadow-md'"
  >
    <button
      @click="toggleExpanded"
      class="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <FunnelIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div class="text-left">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ t('history.filters.title') }}
          </h3>
          <p
            v-if="hasActiveFilters"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            {{ activeFilterCount }} {{ t('history.filters.active_filters') }}
          </p>
        </div>
        <div
          v-if="hasActiveFilters && !isExpanded"
          class="flex items-center gap-2"
        >
          <span
            v-for="filter in activeFilterBadges"
            :key="filter"
            class="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800"
          >
            {{ filter }}
          </span>
        </div>
      </div>
      <ChevronDownIcon
        class="w-5 h-5 text-gray-400 transition-transform duration-200"
        :class="isExpanded ? 'rotate-180' : ''"
      />
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[1500px] opacity-100"
      leave-from-class="max-h-[1500px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-show="isExpanded"
        class="border-t border-gray-200 dark:border-gray-700"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex gap-2">
              <span
                v-for="count in [1, 2, 3]"
                :key="count"
                class="w-8 h-1 rounded-full transition-all duration-300"
                :class="
                  activeFilterCount >= count
                    ? 'bg-primary-500 dark:bg-primary-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                "
              />
            </div>
            <button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
            >
              <XMarkIcon class="w-4 h-4" />
              {{ t('history.filters.clear_all') }}
            </button>
          </div>

          <div class="space-y-6">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                {{ t('history.filters.entity_type') }}
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <label
                  v-for="entity in entityOptions"
                  :key="entity.value"
                  class="relative flex items-center"
                >
                  <input
                    type="checkbox"
                    :checked="selectedEntities.includes(entity.value)"
                    @change="toggleEntity(entity.value)"
                    class="sr-only peer"
                  />
                  <div
                    class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border-2 cursor-pointer transition-all
                      border-gray-300 dark:border-gray-600
                      hover:border-gray-400 dark:hover:border-gray-500
                      peer-checked:border-blue-500 dark:peer-checked:border-blue-400
                      peer-checked:bg-blue-50 dark:peer-checked:bg-blue-950
                      peer-checked:shadow-md peer-checked:shadow-blue-500/20 dark:peer-checked:shadow-blue-400/20"
                  >
                    <component
                      :is="entity.icon"
                      class="w-4 h-4 text-gray-600 dark:text-gray-400
                        peer-checked:text-blue-600 dark:peer-checked:text-blue-400
                        transition-colors"
                    />
                    <span
                      class="text-gray-700 dark:text-gray-300
                        peer-checked:text-blue-900 dark:peer-checked:text-blue-100
                        peer-checked:font-semibold transition-all"
                    >
                      {{ entity.label }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                {{ t('history.filters.action_type') }}
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <label
                  v-for="action in actionOptions"
                  :key="action.value"
                  class="relative flex items-center"
                >
                  <input
                    type="checkbox"
                    :checked="selectedActions.includes(action.value)"
                    @change="toggleAction(action.value)"
                    class="sr-only peer"
                  />
                  <div
                    class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border-2 cursor-pointer transition-all
                      border-gray-300 dark:border-gray-600
                      hover:border-gray-400 dark:hover:border-gray-500
                      peer-checked:border-blue-500 dark:peer-checked:border-blue-400
                      peer-checked:bg-blue-50 dark:peer-checked:bg-blue-950
                      peer-checked:shadow-md peer-checked:shadow-blue-500/20 dark:peer-checked:shadow-blue-400/20"
                  >
                    <div :class="['w-2 h-2 rounded-full transition-all peer-checked:w-3 peer-checked:h-3 peer-checked:ring-2 peer-checked:ring-offset-1 peer-checked:ring-white dark:peer-checked:ring-offset-gray-800', action.color]" />
                    <span
                      class="text-gray-700 dark:text-gray-300
                        peer-checked:text-blue-900 dark:peer-checked:text-blue-100
                        peer-checked:font-semibold transition-all"
                    >
                      {{ action.label }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ t('history.filters.from_date') }}
                </label>
                <input
                  v-model="localFilters.from"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ t('history.filters.to_date') }}
                </label>
                <input
                  v-model="localFilters.to"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ t('history.filters.user') }}
              </label>
              <div class="relative">
                <UserIcon
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  v-model="localFilters.userId"
                  type="text"
                  :placeholder="t('history.filters.user_placeholder')"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ t('history.filters.entity_id') }}
              </label>
              <div class="relative">
                <HashtagIcon
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  v-model="localFilters.entityId"
                  type="text"
                  :placeholder="t('history.filters.entity_id_placeholder')"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          
          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              @click="isExpanded = false"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="applyFilters"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <MagnifyingGlassIcon class="w-4 h-4" />
              {{ t('history.filters.apply') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  FunnelIcon,
  UserIcon,
  HashtagIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  UserGroupIcon,
  KeyIcon,
  CubeIcon,
  BuildingOffice2Icon,
  BoltIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import type { HistoryEntity, HistoryAction, HistoryFilter } from '../types';

interface Props {
  modelValue: HistoryFilter;
}

interface Emits {
  (e: 'update:modelValue', value: HistoryFilter): void;
  (e: 'apply'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const isExpanded = ref(false);
const localFilters = ref<HistoryFilter & { entityId?: string }>({
  ...props.modelValue,
  entityId: '',
});

const selectedEntities = ref<HistoryEntity[]>([]);
const selectedActions = ref<HistoryAction[]>([]);

const entityOptions = computed(() => [
  {
    value: 'auth' as HistoryEntity,
    label: t('history.entities.auth'),
    icon: KeyIcon,
  },
  {
    value: 'user' as HistoryEntity,
    label: t('history.entities.user'),
    icon: UserIcon,
  },
  {
    value: 'server' as HistoryEntity,
    label: t('history.entities.server'),
    icon: ServerIcon,
  },
  {
    value: 'vm' as HistoryEntity,
    label: t('history.entities.vm'),
    icon: CubeIcon,
  },
  {
    value: 'room' as HistoryEntity,
    label: t('history.entities.room'),
    icon: BuildingOffice2Icon,
  },
  {
    value: 'ups' as HistoryEntity,
    label: t('history.entities.ups'),
    icon: BoltIcon,
  },
  {
    value: 'role' as HistoryEntity,
    label: t('history.entities.role'),
    icon: UserGroupIcon,
  },
]);

const actionOptions = computed(() => [
  {
    value: 'create' as HistoryAction,
    label: t('history.actions.create'),
    color: 'bg-green-500',
  },
  {
    value: 'update' as HistoryAction,
    label: t('history.actions.update'),
    color: 'bg-blue-500',
  },
  {
    value: 'delete' as HistoryAction,
    label: t('history.actions.delete'),
    color: 'bg-red-500',
  },
  {
    value: 'login' as HistoryAction,
    label: t('history.actions.login'),
    color: 'bg-purple-500',
  },
  {
    value: 'logout' as HistoryAction,
    label: t('history.actions.logout'),
    color: 'bg-gray-500',
  },
  {
    value: 'start' as HistoryAction,
    label: t('history.actions.start'),
    color: 'bg-emerald-500',
  },
  {
    value: 'stop' as HistoryAction,
    label: t('history.actions.stop'),
    color: 'bg-orange-500',
  },
  {
    value: 'restart' as HistoryAction,
    label: t('history.actions.restart'),
    color: 'bg-indigo-500',
  },
]);

const hasActiveFilters = computed(() => {
  return (
    selectedEntities.value.length > 0 ||
    selectedActions.value.length > 0 ||
    localFilters.value.userId ||
    localFilters.value.entityId ||
    localFilters.value.from ||
    localFilters.value.to
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedEntities.value.length > 0) count++;
  if (selectedActions.value.length > 0) count++;
  if (localFilters.value.userId) count++;
  if (localFilters.value.entityId) count++;
  if (localFilters.value.from) count++;
  if (localFilters.value.to) count++;
  return count;
});

const activeFilterBadges = computed(() => {
  const badges: string[] = [];
  if (selectedEntities.value.length > 0) {
    badges.push(
      `${selectedEntities.value.length} ${t('history.filters.entity_type')}`,
    );
  }
  if (selectedActions.value.length > 0) {
    badges.push(
      `${selectedActions.value.length} ${t('history.filters.action_type')}`,
    );
  }
  if (localFilters.value.from || localFilters.value.to) {
    badges.push(t('history.filters.date_range'));
  }
  return badges.slice(0, 3);
});

const toggleEntity = (entity: HistoryEntity) => {
  const index = selectedEntities.value.indexOf(entity);
  if (index > -1) {
    selectedEntities.value.splice(index, 1);
  } else {
    selectedEntities.value.push(entity);
  }
};

const toggleAction = (action: HistoryAction) => {
  const index = selectedActions.value.indexOf(action);
  if (index > -1) {
    selectedActions.value.splice(index, 1);
  } else {
    selectedActions.value.push(action);
  }
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const clearAllFilters = () => {
  selectedEntities.value = [];
  selectedActions.value = [];
  localFilters.value = {
    entity: '',
    action: '',
    userId: '',
    entityId: '',
    from: '',
    to: '',
  };
  applyFilters();
  isExpanded.value = false;
};

const applyFilters = () => {
  const filters: HistoryFilter & {
    entities?: HistoryEntity[];
    actions?: HistoryAction[];
    entityId?: string;
  } = {
    ...localFilters.value,
    entities:
      selectedEntities.value.length > 0 ? selectedEntities.value : undefined,
    actions:
      selectedActions.value.length > 0 ? selectedActions.value : undefined,
  };

  if (filters.entities && filters.entities.length > 0) {
    delete filters.entity;
  }
  if (filters.actions && filters.actions.length > 0) {
    delete filters.action;
  }

  emit('update:modelValue', filters);
  emit('apply');
  isExpanded.value = false;
};

watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = { ...newValue };
    if (newValue.entity) {
      selectedEntities.value = [newValue.entity as HistoryEntity];
    }
    if (newValue.action) {
      selectedActions.value = [newValue.action as HistoryAction];
    }
  },
  { immediate: true },
);

watch(hasActiveFilters, (hasFilters) => {
  if (hasFilters && !isExpanded.value) {
    isExpanded.value = true;
  }
});
</script>
