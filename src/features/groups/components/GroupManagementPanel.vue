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
        <div
          class="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        />
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
              class="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all"
            >
              <div class="relative">
                <div
                  class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
                  :class="[
                    mode === 'create'
                      ? 'from-green-500 to-emerald-500'
                      : mode === 'edit'
                        ? 'from-blue-500 to-indigo-500'
                        : 'from-purple-500 to-pink-500',
                  ]"
                />

                <div
                  class="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center gap-6">
                    <div
                      class="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <button
                        v-if="currentGroup"
                        @click="setMode('view')"
                        :class="[
                          'px-4 py-2 text-sm font-medium rounded-md transition-all',
                          mode === 'view'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                        ]"
                      >
                        <EyeIcon class="w-4 h-4 inline-block mr-2" />
                        {{ $t('common.view') }}
                      </button>
                      <button
                        @click="setMode(currentGroup ? 'edit' : 'create')"
                        :class="[
                          'px-4 py-2 text-sm font-medium rounded-md transition-all',
                          mode === 'edit' || mode === 'create'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                        ]"
                      >
                        <PencilIcon
                          v-if="currentGroup"
                          class="w-4 h-4 inline-block mr-2"
                        />
                        <PlusIcon v-else class="w-4 h-4 inline-block mr-2" />
                        {{
                          currentGroup ? $t('common.edit') : $t('common.create')
                        }}
                      </button>
                    </div>

                    <div>
                      <h2
                        class="text-xl font-semibold text-gray-900 dark:text-white"
                      >
                        <template v-if="mode === 'create'">
                          {{ $t('groups.createGroup') }}
                        </template>
                        <template v-else-if="mode === 'edit'">
                          {{ $t('groups.editGroup') }}
                        </template>
                        <template v-else>
                          {{ currentGroup?.name }}
                        </template>
                      </h2>
                      <p
                        v-if="mode === 'view' && currentGroup?.description"
                        class="mt-1 text-sm text-gray-600 dark:text-gray-400"
                      >
                        {{ currentGroup.description }}
                      </p>
                    </div>
                  </div>

                  <button
                    @click="close"
                    class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div class="relative h-[600px] overflow-hidden">
                <TransitionGroup
                  name="slide-fade"
                  tag="div"
                  class="relative h-full"
                >
                  <div
                    v-if="mode === 'view'"
                    key="view"
                    class="absolute inset-0 flex"
                  >
                    <ViewModeContent
                      :group="currentGroup!"
                      :resources="groupResources"
                      :loading-resources="loadingResources"
                      @edit="setMode('edit')"
                      @start="handleStart"
                      @stop="handleStop"
                      @delete="handleDelete"
                    />
                  </div>

                  <div v-else key="edit" class="absolute inset-0 flex">
                    <EditModeContent
                      :group="currentGroup"
                      :mode="mode"
                      :form-data="formData"
                      :available-resources="availableResources"
                      :loading-resources="loadingResources"
                      :selected-server-ids="selectedServerIds"
                      :selected-vm-ids="selectedVmIds"
                      @update:form-data="formData = $event"
                      @update:selected-server-ids="selectedServerIds = $event"
                      @update:selected-vm-ids="selectedVmIds = $event"
                    />
                  </div>
                </TransitionGroup>
              </div>

              <div
                class="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center justify-between">
                  <div
                    v-if="mode === 'view'"
                    class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <ClockIcon class="w-4 h-4" />
                    {{ $t('common.lastUpdated') }}:
                    {{ formatDate(currentGroup?.updatedAt) }}
                  </div>
                  <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                    <span
                      v-if="hasChanges"
                      class="text-amber-600 dark:text-amber-400"
                    >
                      <ExclamationTriangleIcon
                        class="w-4 h-4 inline-block mr-1"
                      />
                      {{ $t('common.unsavedChanges') }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3">
                    <button
                      v-if="mode !== 'view'"
                      @click="mode === 'create' ? close() : setMode('view')"
                      class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      v-if="mode !== 'view'"
                      @click="handleSave"
                      :disabled="!isValid || isSaving"
                      class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <ArrowPathIcon
                        v-if="isSaving"
                        class="h-4 w-4 animate-spin"
                      />
                      {{
                        mode === 'create'
                          ? $t('common.create')
                          : $t('common.save')
                      }}
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import {
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';
import type {
  GroupResponseDto,
  CreateGroupDto,
  UpdateGroupDto,
  GroupType,
} from '../types';
import { createGroup, updateGroup } from '../api';
import { patchServer } from '@/features/servers/api';
import { patchVm, fetchUvms } from '@/features/vms/api';
import { useServerStore } from '@/features/servers/store';
import ViewModeContent from './panel/ViewModeContent.vue';
import EditModeContent from './panel/EditModeContent.vue';

type PanelMode = 'view' | 'edit' | 'create';

interface Props {
  isOpen: boolean;
  group?: GroupResponseDto | null;
  initialMode?: PanelMode;
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: 'view',
});

const emit = defineEmits<{
  close: [];
  success: [group: any];
  delete: [group: GroupResponseDto];
  start: [group: GroupResponseDto];
  stop: [group: GroupResponseDto];
}>();

const { t } = useI18n();
const toast = useToast();
const serverStore = useServerStore();

const mode = ref<PanelMode>(props.group ? props.initialMode : 'create');
const isSaving = ref(false);
const currentGroup = ref<GroupResponseDto | null>(null);
const formData = ref<CreateGroupDto & { type: GroupType }>({
  name: '',
  description: '',
  type: 'SERVER',
});

const selectedServerIds = ref<string[]>([]);
const selectedVmIds = ref<string[]>([]);
const originalServerIds = ref<string[]>([]);
const originalVmIds = ref<string[]>([]);
const availableResources = ref<any[]>([]);
const groupResources = ref<any[]>([]);
const loadingResources = ref(false);

const isValid = computed(() => {
  return formData.value.name.trim().length > 0 && formData.value.type;
});

const hasChanges = computed(() => {
  if (mode.value === 'create') return true;
  if (!currentGroup.value) return false;

  const nameChanged = formData.value.name !== currentGroup.value.name;
  const descChanged =
    formData.value.description !== (currentGroup.value.description || '');
  const serversChanged =
    JSON.stringify(selectedServerIds.value.sort()) !==
    JSON.stringify(originalServerIds.value.sort());
  const vmsChanged =
    JSON.stringify(selectedVmIds.value.sort()) !==
    JSON.stringify(originalVmIds.value.sort());

  return nameChanged || descChanged || serversChanged || vmsChanged;
});

const setMode = async (newMode: PanelMode) => {
  if (newMode === 'view' && hasChanges.value) {
    if (!confirm(t('common.unsavedChangesConfirm'))) {
      return;
    }
  }
  mode.value = newMode;

  if (newMode === 'edit' && currentGroup.value) {
    await loadGroupResources();
    await loadAvailableResources();
  }
};

const close = () => {
  if (hasChanges.value && mode.value !== 'view') {
    if (!confirm(t('common.unsavedChangesConfirm'))) {
      return;
    }
  }
  emit('close');
};

const formatDate = (date?: Date | string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString();
};

const loadAvailableResources = async () => {
  loadingResources.value = true;
  try {
    if (formData.value.type === 'SERVER') {
      await serverStore.fetchServers();
      availableResources.value = serverStore.list.map((server) => ({
        id: server.id,
        name: server.name,
        state: server.state || 'unknown',
        roomId: server.roomId,
        type: 'server' as const,
        groupId: server.groupId,
      }));
    } else {
      const vmsResponse = await fetchUvms();
      const vms = Array.isArray(vmsResponse.data) ? vmsResponse.data : [];
      availableResources.value = vms.map((vm) => ({
        id: vm.id,
        name: vm.name,
        state: vm.state || 'unknown',
        type: 'vm' as const,
        groupId: vm.groupId,
      }));
    }

    if (mode.value === 'edit' && currentGroup.value) {
      availableResources.value = availableResources.value.filter(
        (resource) =>
          !resource.groupId || resource.groupId === currentGroup.value!.id,
      );
    } else {
      availableResources.value = availableResources.value.filter(
        (resource) => !resource.groupId,
      );
    }
  } catch (error) {
    availableResources.value = [];
  } finally {
    loadingResources.value = false;
  }
};

const loadGroupResources = async () => {
  if (!currentGroup.value) return;

  loadingResources.value = true;
  try {
    if (currentGroup.value.type === 'SERVER') {
      await serverStore.fetchServers();
      const servers = serverStore.list.filter(
        (server) => server.groupId === currentGroup.value!.id,
      );
      groupResources.value = servers.map((server) => ({
        id: server.id,
        name: server.name,
        state: server.state,
        ip: server.ip,
        roomId: server.roomId,
      }));
      originalServerIds.value = servers.map((s) => s.id);
      selectedServerIds.value = [...originalServerIds.value];
    } else {
      const vmsResponse = await fetchUvms();
      const vms = Array.isArray(vmsResponse.data) ? vmsResponse.data : [];
      const groupVms = vms.filter(
        (vm) => vm.groupId === currentGroup.value!.id,
      );
      groupResources.value = groupVms.map((vm) => ({
        id: vm.id,
        name: vm.name,
        state: vm.state,
      }));
      originalVmIds.value = groupVms.map((v) => v.id);
      selectedVmIds.value = [...originalVmIds.value];
    }
  } catch (error) {
  } finally {
    loadingResources.value = false;
  }
};

const handleSave = async () => {
  if (!isValid.value || isSaving.value) return;

  isSaving.value = true;

  try {
    let group: GroupResponseDto;

    if (mode.value === 'edit' && currentGroup.value) {
      const updatePayload: UpdateGroupDto = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || undefined,
      };
      group = await updateGroup(currentGroup.value.id, updatePayload);

      const currentServerIds =
        formData.value.type === 'SERVER' ? selectedServerIds.value : [];
      const currentVmIds =
        formData.value.type === 'VM' ? selectedVmIds.value : [];

      const serversToAdd = currentServerIds.filter(
        (id) => !originalServerIds.value.includes(id),
      );
      const serversToRemove = originalServerIds.value.filter(
        (id) => !currentServerIds.includes(id),
      );
      const vmsToAdd = currentVmIds.filter(
        (id) => !originalVmIds.value.includes(id),
      );
      const vmsToRemove = originalVmIds.value.filter(
        (id) => !currentVmIds.includes(id),
      );

      const promises = [];
      for (const serverId of serversToAdd) {
        promises.push(patchServer(serverId, { groupId: group.id }));
      }
      for (const serverId of serversToRemove) {
        promises.push(patchServer(serverId, { groupId: null }));
      }
      for (const vmId of vmsToAdd) {
        promises.push(patchVm(vmId, { groupId: group.id }));
      }
      for (const vmId of vmsToRemove) {
        promises.push(patchVm(vmId, { groupId: null }));
      }

      await Promise.allSettled(promises);
      toast.success(t('groups.updateSuccess'));
    } else {
      const createPayload: CreateGroupDto = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || undefined,
        type: formData.value.type,
      };
      group = await createGroup(createPayload);

      const resourceIds =
        formData.value.type === 'SERVER'
          ? selectedServerIds.value
          : selectedVmIds.value;
      if (resourceIds.length > 0) {
        const promises = resourceIds.map((id) =>
          formData.value.type === 'SERVER'
            ? patchServer(id, { groupId: group.id })
            : patchVm(id, { groupId: group.id }),
        );
        await Promise.allSettled(promises);
      }

      toast.success(t('groups.createSuccess'));
    }

    await serverStore.fetchServers();

    emit('success', group);
    if (mode.value === 'create') {
      emit('close');
    } else {
      currentGroup.value = group;
      mode.value = 'view';
      await loadGroupResources();
    }
  } catch (error) {
    toast.error(
      mode.value === 'edit' ? t('groups.updateError') : t('groups.createError'),
    );
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = (group: GroupResponseDto) => {
  emit('delete', group);
};

const handleStart = (group: GroupResponseDto) => {
  emit('start', group);
};

const handleStop = (group: GroupResponseDto) => {
  emit('stop', group);
};

watch(
  [() => props.isOpen, () => props.group],
  async ([isOpen, group]) => {
    if (isOpen) {
      if (group) {
        currentGroup.value = { ...group }; // Create a copy
        mode.value = props.initialMode;
        formData.value = {
          name: group.name,
          description: group.description || '',
          type: group.type,
        };
        await loadGroupResources();
      } else {
        currentGroup.value = null;
        mode.value = 'create';
        formData.value = {
          name: '',
          description: '',
          type: 'SERVER',
        };
        selectedServerIds.value = [];
        selectedVmIds.value = [];
      }
      await loadAvailableResources();
    }
  },
  { immediate: true },
);

watch(
  () => formData.value.type,
  () => {
    if (props.isOpen && mode.value === 'create') {
      selectedServerIds.value = [];
      selectedVmIds.value = [];
      loadAvailableResources();
    }
  },
);
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
