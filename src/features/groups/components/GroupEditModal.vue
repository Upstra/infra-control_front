<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 dark:bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all"
            >
              <form @submit.prevent="handleSubmit">
                <div
                  class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
                >
                  <DialogTitle
                    class="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {{
                      isEditing
                        ? $t('groups.editGroup')
                        : $t('groups.createGroup')
                    }}
                  </DialogTitle>
                  <button
                    type="button"
                    @click="close"
                    class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <div class="px-6 py-4 space-y-6">
                  <!-- Basic Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.name') }}
                      </label>
                      <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('groups.namePlaceholder')"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.type') }}
                      </label>
                      <select
                        v-model="formData.type"
                        :disabled="isEditing"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="server">
                          {{ $t('groups.serverGroup') }}
                        </option>
                        <option value="vm">{{ $t('groups.vmGroup') }}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ $t('groups.description') }}
                    </label>
                    <textarea
                      v-model="formData.description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      :placeholder="$t('groups.descriptionPlaceholder')"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.priority') }}
                      </label>
                      <input
                        v-model.number="formData.priority"
                        type="number"
                        min="1"
                        max="10"
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ $t('groups.priorityHelp') }}
                      </p>
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.room') }}
                      </label>
                      <select
                        v-model="formData.roomId"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{{ $t('groups.noRoom') }}</option>
                        <option
                          v-for="room in rooms"
                          :key="room.id"
                          :value="room.id"
                        >
                          {{ room.name }}
                        </option>
                      </select>
                    </div>

                    <div class="flex items-center pt-6">
                      <label class="flex items-center cursor-pointer">
                        <input
                          v-model="formData.cascade"
                          type="checkbox"
                          class="sr-only peer"
                        />
                        <div
                          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                        ></div>
                        <span
                          class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {{ $t('groups.cascade') }}
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- Server Group Specific -->
                  <div
                    v-if="formData.type === 'vm' && !isEditing"
                    class="space-y-2"
                  >
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {{ $t('groups.parentServerGroup') }}
                    </label>
                    <select
                      v-model="formData.serverGroupId"
                      required
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">
                        {{ $t('groups.selectServerGroup') }}
                      </option>
                      <option
                        v-for="group in serverGroups"
                        :key="group.id"
                        :value="group.id"
                      >
                        {{ group.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Resource Selection -->
                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <h3
                        class="text-lg font-medium text-gray-900 dark:text-white"
                      >
                        {{
                          formData.type === 'server'
                            ? $t('groups.servers')
                            : $t('groups.vms')
                        }}
                      </h3>
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        {{ selectedResourceIds.length }}
                        {{ $t('groups.selected') }}
                      </span>
                    </div>

                    <ResourceSelector
                      v-model="selectedResourceIds"
                      :type="formData.type"
                      :available-resources="availableResources"
                      :loading="loadingResources"
                      @search="handleResourceSearch"
                    />
                  </div>
                </div>

                <div
                  class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
                >
                  <button
                    type="button"
                    @click="close"
                    class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowPathIcon
                      v-if="isSubmitting"
                      class="w-4 h-4 animate-spin"
                    />
                    {{ isEditing ? $t('common.save') : $t('common.create') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
import type {
  GroupServerResponseDto,
  GroupVmResponseDto,
  CreateGroupPayload,
  UpdateGroupPayload,
} from '../types';
import { useGroupStore } from '../store';
import { useServerStore } from '@/features/servers/store';
import { useRoomStore } from '@/features/rooms/store';
import ResourceSelector from './ResourceSelector.vue';

interface Props {
  isOpen: boolean;
  group?: GroupServerResponseDto | GroupVmResponseDto | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  save: [payload: CreateGroupPayload | UpdateGroupPayload];
}>();

const { t: $t } = useI18n();
const groupStore = useGroupStore();
const serverStore = useServerStore();
const roomStore = useRoomStore();

const isEditing = computed(() => !!props.group);
const isSubmitting = ref(false);
const loadingResources = ref(false);

const formData = ref<CreateGroupPayload>({
  name: '',
  description: '',
  type: 'server',
  priority: 5,
  cascade: true,
  roomId: '',
  resourceIds: [],
  serverGroupId: '',
});

const selectedResourceIds = ref<string[]>([]);
const availableResources = ref<
  Array<{ id: string; name: string; state?: string; roomId?: string }>
>([]);

const rooms = computed(() => roomStore.list || []);
const serverGroups = computed(() =>
  groupStore.allGroups.filter((g) => g.type === 'server'),
);

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    type: 'server',
    priority: 5,
    cascade: true,
    roomId: '',
    resourceIds: [],
    serverGroupId: '',
  };
  selectedResourceIds.value = [];
};

watch(
  () => props.group,
  (group) => {
    if (group) {
      formData.value = {
        name: group.name,
        description: group.description || '',
        type: group.type,
        priority: group.priority,
        cascade: group.cascade,
        roomId: group.roomId || '',
        resourceIds: [],
        serverGroupId: group.type === 'vm' ? (group as any).serverGroupId : '',
      };

      if (group.type === 'server') {
        selectedResourceIds.value =
          (group as GroupServerResponseDto).serverIds || [];
      } else {
        selectedResourceIds.value = (group as GroupVmResponseDto).vmIds || [];
      }
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

watch(selectedResourceIds, (ids) => {
  formData.value.resourceIds = ids;
});

watch(
  () => formData.value.type,
  () => {
    selectedResourceIds.value = [];
    if (!isEditing.value) {
      loadResources();
    }
  },
);

const loadResources = async () => {
  loadingResources.value = true;
  try {
    await serverStore.fetchServers();

    if (formData.value.type === 'server') {
      availableResources.value = serverStore.list
        .filter((s) => s.type === 'physical')
        .map((s) => ({
          id: s.id,
          name: s.name,
          state: s.state,
          roomId: s.roomId,
          type: 'server' as const,
        }));
    } else {
      availableResources.value = serverStore.list
        .filter((s) => s.type === 'virtual')
        .map((s) => ({
          id: s.id,
          name: s.name,
          state: s.state,
          roomId: s.roomId,
          type: 'vm' as const,
        }));
    }
  } finally {
    loadingResources.value = false;
  }
};

const handleResourceSearch = (query: string) => {
  if (!query) {
    loadResources();
    return;
  }

  const lowerQuery = query.toLowerCase();
  if (formData.value.type === 'server') {
    availableResources.value = serverStore.list
      .filter(
        (s) =>
          s.type === 'physical' && s.name.toLowerCase().includes(lowerQuery),
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        state: s.state,
        roomId: s.roomId,
        type: 'server' as const,
      }));
  } else {
    availableResources.value = serverStore.list
      .filter(
        (s) =>
          s.type === 'virtual' && s.name.toLowerCase().includes(lowerQuery),
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        state: s.state,
        roomId: s.roomId,
        type: 'vm' as const,
      }));
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = isEditing.value
      ? ({
          name: formData.value.name,
          description: formData.value.description,
          type: formData.value.type,
          priority: formData.value.priority,
          cascade: formData.value.cascade,
          resourceIds: selectedResourceIds.value,
        } as UpdateGroupPayload)
      : formData.value;

    emit('save', payload);
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  emit('close');
  resetForm();
};

onMounted(() => {
  if (!rooms.value.length) {
    roomStore.fetchRooms();
  }
  loadResources();
});
</script>
