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

                <div class="flex h-[600px]">
                  <div
                    class="w-1/3 px-6 py-4 space-y-6 border-r border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.form.name') }}
                      </label>
                      <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        :placeholder="$t('groups.form.namePlaceholder')"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.form.description') }}
                      </label>
                      <textarea
                        v-model="formData.description"
                        rows="4"
                        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        :placeholder="$t('groups.form.descriptionPlaceholder')"
                      />
                    </div>

                    <div v-if="!isEditing">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('groups.form.type') }}
                      </label>
                      <div class="grid grid-cols-2 gap-3">
                        <label
                          :class="[
                            'relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all',
                            formData.type === 'SERVER'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                          ]"
                        >
                          <input
                            type="radio"
                            v-model="formData.type"
                            value="SERVER"
                            class="sr-only"
                          />
                          <ServerIcon class="w-5 h-5 mr-2" />
                          <span class="font-medium">{{
                            $t('groups.serverGroup')
                          }}</span>
                        </label>
                        <label
                          :class="[
                            'relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all',
                            formData.type === 'VM'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                          ]"
                        >
                          <input
                            type="radio"
                            v-model="formData.type"
                            value="VM"
                            class="sr-only"
                          />
                          <CpuChipIcon class="w-5 h-5 mr-2" />
                          <span class="font-medium">{{
                            $t('groups.vmGroup')
                          }}</span>
                        </label>
                      </div>
                    </div>

                    <div
                      v-else
                      class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                    >
                      <div class="flex items-center">
                        <component
                          :is="
                            formData.type === 'SERVER'
                              ? ServerIcon
                              : CpuChipIcon
                          "
                          class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"
                        />
                        <div>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ $t('groups.form.type') }}
                          </p>
                          <p class="font-medium text-gray-900 dark:text-white">
                            {{
                              formData.type === 'SERVER'
                                ? $t('groups.serverGroup')
                                : $t('groups.vmGroup')
                            }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="mt-auto">
                      <div
                        class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
                      >
                        <div class="flex items-center justify-between">
                          <span
                            class="text-sm font-medium text-blue-700 dark:text-blue-400"
                          >
                            {{ $t('groups.form.selectedResources') }}
                          </span>
                          <span
                            class="text-2xl font-bold text-blue-700 dark:text-blue-400"
                          >
                            {{
                              formData.type === 'SERVER'
                                ? selectedServerIds.length
                                : selectedVmIds.length
                            }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex-1 px-6 py-4">
                    <h3
                      class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                    >
                      {{
                        formData.type === 'SERVER'
                          ? $t('groups.form.selectServers')
                          : $t('groups.form.selectVms')
                      }}
                    </h3>

                    <ResourceSelector
                      v-if="availableResources.length > 0 || loadingResources"
                      :model-value="
                        formData.type === 'SERVER'
                          ? selectedServerIds
                          : selectedVmIds
                      "
                      :type="formData.type === 'SERVER' ? 'server' : 'vm'"
                      :available-resources="availableResources"
                      :loading="loadingResources"
                      @update:model-value="handleResourceSelection"
                    />
                    <div v-else class="flex items-center justify-center h-full">
                      <div class="text-center">
                        <component
                          :is="
                            formData.type === 'SERVER'
                              ? ServerIcon
                              : CpuChipIcon
                          "
                          class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
                        />
                        <p class="text-gray-600 dark:text-gray-400">
                          {{
                            formData.type === 'SERVER'
                              ? $t('groups.form.noServersAvailable')
                              : $t('groups.form.noVmsAvailable')
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <button
                    type="button"
                    @click="close"
                    class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="!isValid || isSubmitting"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ArrowPathIcon
                      v-if="isSubmitting"
                      class="h-4 w-4 animate-spin"
                    />
                    {{ isEditing ? $t('common.update') : $t('common.create') }}
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
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
import { ServerIcon, CpuChipIcon } from '@heroicons/vue/24/outline';
import type {
  GroupResponseDto,
  CreateGroupDto,
  UpdateGroupDto,
  GroupType,
} from '../types';
import { createGroup, updateGroup } from '../api';
import { patchServer } from '@/features/servers/api';
import { patchVm } from '@/features/vms/api';
import { useServerStore } from '@/features/servers/store';
import { fetchUvms } from '@/features/vms/api';
import ResourceSelector from './ResourceSelector.vue';

interface Props {
  isOpen: boolean;
  group?: GroupResponseDto | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  success: [group: any];
}>();

const { t: $t } = useI18n();
const toast = useToast();
const serverStore = useServerStore();

const isEditing = computed(() => !!props.group);
const isSubmitting = ref(false);

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
const loadingResources = ref(false);

const isValid = computed(() => {
  return formData.value.name.trim().length > 0 && formData.value.type;
});

const handleResourceSelection = (resourceIds: string[]) => {
  if (formData.value.type === 'SERVER') {
    selectedServerIds.value = resourceIds;
  } else {
    selectedVmIds.value = resourceIds;
  }
};

// Load available resources based on type
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

    // Filter out resources already in other groups (except current group when editing)
    if (isEditing.value && props.group) {
      availableResources.value = availableResources.value.filter(
        (resource) => !resource.groupId || resource.groupId === props.group!.id,
      );
    } else {
      availableResources.value = availableResources.value.filter(
        (resource) => !resource.groupId,
      );
    }
  } catch (error) {
    console.error('Error loading resources:', error);
    availableResources.value = [];
  } finally {
    loadingResources.value = false;
  }
};

// Load current group resources
const loadCurrentGroupResources = async (groupId: string) => {
  try {
    // Load servers
    await serverStore.fetchServers();
    const groupServers = serverStore.list.filter(
      (server) => server.groupId === groupId,
    );
    originalServerIds.value = groupServers.map((server) => server.id);
    selectedServerIds.value = [...originalServerIds.value];

    // Load VMs
    const vmsResponse = await fetchUvms();
    const vms = Array.isArray(vmsResponse.data) ? vmsResponse.data : [];
    const groupVms = vms.filter((vm) => vm.groupId === groupId);
    originalVmIds.value = groupVms.map((vm) => vm.id);
    selectedVmIds.value = [...originalVmIds.value];
  } catch (error) {
    console.error('Error loading group resources:', error);
  }
};

// Reset form when modal opens/closes or group changes
watch(
  [() => props.isOpen, () => props.group],
  ([isOpen, group]) => {
    if (isOpen) {
      if (group) {
        // Editing existing group
        formData.value = {
          name: group.name,
          description: group.description || '',
          type: group.type,
        };
        loadCurrentGroupResources(group.id);
      } else {
        // Creating new group
        formData.value = {
          name: '',
          description: '',
          type: 'SERVER',
        };
        selectedServerIds.value = [];
        selectedVmIds.value = [];
        originalServerIds.value = [];
        originalVmIds.value = [];
      }
      // Load available resources when modal opens
      loadAvailableResources();
    }
  },
  { immediate: true },
);

// Reload resources when type changes
watch(
  () => formData.value.type,
  () => {
    if (props.isOpen && !isEditing.value) {
      selectedServerIds.value = [];
      selectedVmIds.value = [];
      loadAvailableResources();
    }
  },
);

const assignResourcesToGroup = async (
  groupId: string,
  serverIds: string[],
  vmIds: string[],
) => {
  const errors: Array<{ type: string; id: string; error: any }> = [];
  const successes: Array<{ type: string; id: string }> = [];

  // Assign servers
  for (const serverId of serverIds) {
    try {
      await patchServer(serverId, { groupId });
      successes.push({ type: 'server', id: serverId });
    } catch (error) {
      console.error(`Error assigning server ${serverId}:`, error);
      errors.push({ type: 'server', id: serverId, error });
    }
  }

  // Assign VMs
  for (const vmId of vmIds) {
    try {
      await patchVm(vmId, { groupId });
      successes.push({ type: 'vm', id: vmId });
    } catch (error) {
      console.error(`Error assigning VM ${vmId}:`, error);
      errors.push({ type: 'vm', id: vmId, error });
    }
  }

  return { successes, errors };
};

const unassignResourcesFromGroup = async (
  serverIds: string[],
  vmIds: string[],
) => {
  const errors: Array<{ type: string; id: string; error: any }> = [];
  const successes: Array<{ type: string; id: string }> = [];

  // Unassign servers
  for (const serverId of serverIds) {
    try {
      await patchServer(serverId, { groupId: null });
      successes.push({ type: 'server', id: serverId });
    } catch (error) {
      console.error(`Error unassigning server ${serverId}:`, error);
      errors.push({ type: 'server', id: serverId, error });
    }
  }

  // Unassign VMs
  for (const vmId of vmIds) {
    try {
      await patchVm(vmId, { groupId: null });
      successes.push({ type: 'vm', id: vmId });
    } catch (error) {
      console.error(`Error unassigning VM ${vmId}:`, error);
      errors.push({ type: 'vm', id: vmId, error });
    }
  }

  return { successes, errors };
};

const close = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!isValid.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    let group;

    if (isEditing.value) {
      // Update existing group
      const updatePayload: UpdateGroupDto = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || undefined,
      };
      group = await updateGroup(props.group!.id, updatePayload);

      // Handle resource changes for editing
      const currentServerIds =
        formData.value.type === 'SERVER' ? selectedServerIds.value : [];
      const currentVmIds =
        formData.value.type === 'VM' ? selectedVmIds.value : [];

      // Calculate changes
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

      // Apply changes
      if (serversToAdd.length > 0 || vmsToAdd.length > 0) {
        await assignResourcesToGroup(group.id, serversToAdd, vmsToAdd);
      }

      if (serversToRemove.length > 0 || vmsToRemove.length > 0) {
        await unassignResourcesFromGroup(serversToRemove, vmsToRemove);
      }

      toast.success($t('groups.updateSuccess'));
    } else {
      // Create new group
      const createPayload: CreateGroupDto = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || undefined,
        type: formData.value.type,
      };
      group = await createGroup(createPayload);

      // Assign selected resources to the new group
      const resourceServerIds =
        formData.value.type === 'SERVER' ? selectedServerIds.value : [];
      const resourceVmIds =
        formData.value.type === 'VM' ? selectedVmIds.value : [];

      if (resourceServerIds.length > 0 || resourceVmIds.length > 0) {
        const { successes, errors } = await assignResourcesToGroup(
          group.id,
          resourceServerIds,
          resourceVmIds,
        );

        if (errors.length > 0) {
          toast.warning(
            $t('groups.form.partialAssignmentError', {
              assigned: successes.length,
              failed: errors.length,
            }),
          );
        } else if (successes.length > 0) {
          toast.success(
            $t('groups.form.allResourcesAssigned', { count: successes.length }),
          );
        }
      }

      toast.success($t('groups.createSuccess'));
    }

    emit('success', group);
  } catch (error) {
    console.error('Error saving group:', error);
    toast.error(
      isEditing.value ? $t('groups.updateError') : $t('groups.createError'),
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
