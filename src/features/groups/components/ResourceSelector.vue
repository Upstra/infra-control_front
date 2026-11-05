<template>
  <div class="resource-selector">
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('groups.searchResources')"
          class="w-full pl-10 pr-4 py-2 border border-border-control rounded-lg bg-surface text-text-strong focus:ring-2 focus:ring-primary focus:border-transparent"
          @input="handleSearch"
        />
        <MagnifyingGlassIcon
          class="absolute left-3 top-2.5 w-5 h-5 text-text-muted"
        />
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button
          @click="selectAll"
          class="text-sm text-primary-text hover:text-primary-text"
        >
          {{ t('common.selectAll') }}
        </button>
        <span class="text-text-muted">|</span>
        <button
          @click="deselectAll"
          class="text-sm text-text hover:text-text"
        >
          {{ t('common.deselectAll') }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-1.5 rounded transition-colors',
            viewMode === 'grid'
              ? 'bg-surface-raised text-text-strong'
              : 'text-text-muted hover:text-text',
          ]"
        >
          <Squares2X2Icon class="w-4 h-4" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-1.5 rounded transition-colors',
            viewMode === 'list'
              ? 'bg-surface-raised text-text-strong'
              : 'text-text-muted hover:text-text',
          ]"
        >
          <ListBulletIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div
      class="border border-border rounded-lg overflow-hidden"
      :class="loading ? 'min-h-[300px] flex items-center justify-center' : ''"
    >
      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"
        ></div>
        <p class="text-text-muted">
          {{ t('common.loading') }}
        </p>
      </div>

      <div v-else-if="filteredResources.length === 0" class="text-center py-12">
        <ServerIcon
          v-if="type === 'server'"
          class="mx-auto h-12 w-12 text-text-muted mb-4"
        />
        <CpuChipIcon
          v-else
          class="mx-auto h-12 w-12 text-text-muted mb-4"
        />
        <p class="text-text">
          {{ t('groups.noResourcesFound') }}
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
                ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)]'
                : 'border-border hover:border-border-control bg-surface',
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h4
                  class="text-sm font-medium text-text-strong truncate"
                >
                  {{ resource.name }}
                </h4>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      resource.state === 'active'
                        ? 'bg-success-surface text-success-text'
                        : 'bg-surface-raised text-text-strong',
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
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border-control',
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

        <div v-else class="divide-y divide-border">
          <label
            v-for="resource in filteredResources"
            :key="resource.id"
            class="flex items-center px-4 py-3 hover:bg-surface-sunken cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              :checked="isSelected(resource.id)"
              @change="toggleResource(resource.id)"
              class="h-4 w-4 text-primary-text focus:ring-primary border-border-control rounded"
            />
            <div class="ml-3 flex-1 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-text-strong">
                  {{ resource.name }}
                </p>
                <p class="text-xs text-text-muted">
                  <template v-if="type === 'server'">
                    {{ getRoomName(resource.roomId) || t('groups.noRoom') }}
                  </template>
                  <template v-else>
                    {{ resource.serverName || t('groups.noServer') }}
                  </template>
                </p>
              </div>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  resource.state === 'active'
                    ? 'bg-success-surface text-success-text'
                    : 'bg-surface-raised text-text-strong',
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
      <p class="text-sm text-text">
        {{
          t('groups.selectedCount', {
            count: modelValue.length,
            total: availableResources.length,
          })
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  serverName?: string;
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

const { t } = useI18n();
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

const getRoomName = (roomId?: string) => {
  if (!roomId) return null;
  const room = rooms.value.find((r) => r.id === roomId);
  return room?.name;
};

onMounted(async () => {
  if (props.type === 'server' && rooms.value.length === 0) {
    await roomStore.fetchRooms();
  }
});
</script>

<style scoped>
.resource-selector {
  @apply space-y-4;
}
</style>
