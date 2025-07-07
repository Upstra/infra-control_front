<template>
  <div class="resource-selector">
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('groups.searchResources')"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="handleSearch"
        />
        <MagnifyingGlassIcon
          class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
        />
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button
          @click="selectAll"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {{ $t('common.selectAll') }}
        </button>
        <span class="text-gray-400">|</span>
        <button
          @click="deselectAll"
          class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {{ $t('common.deselectAll') }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-1.5 rounded transition-colors',
            viewMode === 'grid'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
        >
          <Squares2X2Icon class="w-4 h-4" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-1.5 rounded transition-colors',
            viewMode === 'list'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
        >
          <ListBulletIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div
      class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      :class="loading ? 'min-h-[300px] flex items-center justify-center' : ''"
    >
      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">
          {{ $t('common.loading') }}
        </p>
      </div>

      <div v-else-if="filteredResources.length === 0" class="text-center py-12">
        <ServerIcon
          v-if="type === 'server'"
          class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
        />
        <CpuChipIcon
          v-else
          class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('groups.noResourcesFound') }}
        </p>
      </div>

      <div v-else>
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-2 md:grid-cols-3 gap-3 p-4"
        >
          <div
            v-for="resource in filteredResources"
            :key="resource.id"
            @click="toggleResource(resource.id)"
            :class="[
              'relative p-4 rounded-lg border-2 cursor-pointer transition-all',
              isSelected(resource.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h4
                  class="text-sm font-medium text-gray-900 dark:text-white truncate"
                >
                  {{ resource.name }}
                </h4>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      resource.state === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    ]"
                  >
                    {{ resource.state || 'unknown' }}
                  </span>
                </div>
              </div>
              <div
                :class="[
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all',
                  isSelected(resource.id)
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600',
                ]"
              >
                <CheckIcon
                  v-if="isSelected(resource.id)"
                  class="w-3 h-3 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <label
            v-for="resource in filteredResources"
            :key="resource.id"
            class="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              :checked="isSelected(resource.id)"
              @change="toggleResource(resource.id)"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <div class="ml-3 flex-1 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ resource.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{
                    resource.roomId
                      ? rooms.find((r: any) => r.id === resource.roomId)?.name
                      : $t('groups.noRoom')
                  }}
                </p>
              </div>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  resource.state === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                ]"
              >
                {{ resource.state || 'unknown' }}
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{
          $t('groups.selectedCount', {
            count: modelValue.length,
            total: availableResources.length,
          })
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ServerIcon,
  CpuChipIcon,
} from '@heroicons/vue/24/outline';
import { CheckIcon } from '@heroicons/vue/24/solid';
import { useRoomStore } from '@/features/rooms/store';

interface Resource {
  id: string;
  name: string;
  state?: string;
  roomId?: string;
  type?: 'server' | 'vm';
}

interface Props {
  modelValue: string[];
  type: 'server' | 'vm';
  availableResources: Resource[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  search: [query: string];
}>();

const { t: $t } = useI18n();
const roomStore = useRoomStore();

const searchQuery = ref('');
const viewMode = ref<'grid' | 'list'>('grid');

const rooms = computed(() => roomStore.list || []);

const filteredResources = computed(() => {
  if (!searchQuery.value) return props.availableResources;

  const query = searchQuery.value.toLowerCase();
  return props.availableResources.filter((resource) =>
    resource.name.toLowerCase().includes(query),
  );
});

const isSelected = (id: string) => props.modelValue.includes(id);

const toggleResource = (id: string) => {
  const newValue = isSelected(id)
    ? props.modelValue.filter((resourceId) => resourceId !== id)
    : [...props.modelValue, id];

  emit('update:modelValue', newValue);
};

const selectAll = () => {
  const allIds = filteredResources.value.map((r) => r.id);
  const newValue = [...new Set([...props.modelValue, ...allIds])];
  emit('update:modelValue', newValue);
};

const deselectAll = () => {
  const filteredIds = filteredResources.value.map((r) => r.id);
  const newValue = props.modelValue.filter((id) => !filteredIds.includes(id));
  emit('update:modelValue', newValue);
};

const handleSearch = () => {
  emit('search', searchQuery.value);
};
</script>

<style scoped>
.resource-selector {
  @apply space-y-4;
}
</style>
