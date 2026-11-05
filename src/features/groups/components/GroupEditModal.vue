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
        <div class="fixed inset-0 bg-black/30" />
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
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-surface shadow-xl transition-all"
            >
              <form @submit.prevent="handleSubmit">
                <div
                  class="flex items-center justify-between px-6 py-4 border-b border-border"
                >
                  <DialogTitle
                    class="text-xl font-semibold text-text-strong"
                  >
                    {{
                      isEditing
                        ? t('groups.editGroup')
                        : t('groups.createGroup')
                    }}
                  </DialogTitle>
                  <button
                    type="button"
                    @click="close"
                    class="text-text-muted hover:text-text-muted transition-colors"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <div class="flex h-[600px]">
                  <div
                    class="w-1/3 px-6 py-4 space-y-6 border-r border-border"
                  >
                    <div>
                      <label
                        class="block text-sm font-medium text-text mb-2"
                      >
                        {{ t('groups.form.name') }}
                      </label>
                      <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="w-full px-4 py-2.5 border border-border-control rounded-lg bg-surface text-text-strong focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        :placeholder="t('groups.form.namePlaceholder')"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-text mb-2"
                      >
                        {{ t('groups.form.description') }}
                      </label>
                      <textarea
                        v-model="formData.description"
                        rows="4"
                        class="w-full px-4 py-2.5 border border-border-control rounded-lg bg-surface text-text-strong focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                        :placeholder="t('groups.form.descriptionPlaceholder')"
                      />
                    </div>

                    <div v-if="!isEditing">
                      <label
                        class="block text-sm font-medium text-text mb-2"
                      >
                        {{ t('groups.form.type') }}
                      </label>
                      <div class="grid grid-cols-2 gap-3">
                        <label
                          :class="[
                            'relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all',
                            formData.type === 'SERVER'
                              ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text'
                              : 'border-border-control hover:border-border-control',
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
                            t('groups.serverGroup')
                          }}</span>
                        </label>
                        <label
                          :class="[
                            'relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all',
                            formData.type === 'VM'
                              ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text'
                              : 'border-border-control hover:border-border-control',
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
                            t('groups.vmGroup')
                          }}</span>
                        </label>
                      </div>
                    </div>

                    <div
                      v-else
                      class="bg-surface-sunken rounded-lg p-4"
                    >
                      <div class="flex items-center">
                        <component
                          :is="
                            formData.type === 'SERVER'
                              ? ServerIcon
                              : CpuChipIcon
                          "
                          class="w-5 h-5 text-text-muted mr-2"
                        />
                        <div>
                          <p class="text-xs text-text-muted">
                            {{ t('groups.form.type') }}
                          </p>
                          <p class="font-medium text-text-strong">
                            {{
                              formData.type === 'SERVER'
                                ? t('groups.serverGroup')
                                : t('groups.vmGroup')
                            }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="mt-auto">
                      <div
                        class="bg-[rgb(var(--c-primary-hover)/0.1)] rounded-lg p-4"
                      >
                        <div class="flex items-center justify-between">
                          <span
                            class="text-sm font-medium text-primary-text"
                          >
                            {{ t('groups.form.selectedResources') }}
                          </span>
                          <span
                            class="text-2xl font-bold text-primary-text"
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
                    <div class="flex items-center justify-between mb-4">
                      <h3
                        class="text-lg font-semibold text-text-strong"
                      >
                        {{
                          formData.type === 'SERVER'
                            ? t('groups.form.selectServers')
                            : t('groups.form.selectVms')
                        }}
                      </h3>
                      <button
                        type="button"
                        @click="
                          refreshResources(formData.type, {
                            excludeWithGroup: true,
                            includeGroupId: group?.id,
                          })
                        "
                        :disabled="loadingResources"
                        class="text-sm text-primary-text hover:text-primary-text transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <ArrowPathIcon
                          class="w-4 h-4"
                          :class="{ 'animate-spin': loadingResources }"
                        />
                        {{ t('common.refresh') }}
                      </button>
                    </div>

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
                          class="mx-auto h-12 w-12 text-text-muted mb-4"
                        />
                        <p class="text-text">
                          {{
                            formData.type === 'SERVER'
                              ? t('groups.form.noServersAvailable')
                              : t('groups.form.noVmsAvailable')
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="flex justify-end gap-3 px-6 py-4 border-t border-border"
                >
                  <button
                    type="button"
                    @click="close"
                    class="px-4 py-2 text-text bg-surface-raised hover:bg-surface-raised rounded-lg transition-colors"
                  >
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="!isValid || isSubmitting"
                    class="px-4 py-2 bg-primary hover:bg-primary disabled:bg-border-strong text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ArrowPathIcon
                      v-if="isSubmitting"
                      class="h-4 w-4 animate-spin"
                    />
                    {{ isEditing ? t('common.update') : t('common.create') }}
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
import { patchVm, fetchUvms } from '@/features/vms/api';
import { useServerStore } from '@/features/servers/store';
import { useGroupResources } from '../composables/useGroupResources';
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

const { t } = useI18n();
const toast = useToast();
const serverStore = useServerStore();

const isEditing = computed(() => !!props.group);
const isSubmitting = ref(false);

const formData = ref<CreateGroupDto & { type: GroupType }>({
  name: '',
  description: '',
  type: 'SERVER',
});

const {
  availableResources,
  loadingResources,
  loadResources,
  refreshResources,
} = useGroupResources();

const selectedServerIds = ref<string[]>([]);
const selectedVmIds = ref<string[]>([]);
const originalServerIds = ref<string[]>([]);
const originalVmIds = ref<string[]>([]);

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

const loadAvailableResources = async () => {
  await loadResources(formData.value.type, {
    excludeWithGroup: true,
    includeGroupId: props.group?.id,
  });
};

const loadCurrentGroupResources = async (groupId: string) => {
  try {
    await serverStore.fetchServers();
    const groupServers = serverStore.list.filter(
      (server) => server.groupId === groupId,
    );
    originalServerIds.value = groupServers.map((server) => server.id);
    selectedServerIds.value = [...originalServerIds.value];

    const vmsResponse = await fetchUvms();
    const vms = Array.isArray(vmsResponse.items) ? vmsResponse.items : [];
    const groupVms = vms.filter((vm: any) => vm.groupId === groupId);
    originalVmIds.value = groupVms.map((vm: any) => vm.id);
    selectedVmIds.value = [...originalVmIds.value];
  } catch (error) {}
};

watch(
  [() => props.isOpen, () => props.group],
  ([isOpen, group]) => {
    if (isOpen) {
      if (group) {
        formData.value = {
          name: group.name,
          description: group.description || '',
          type: group.type,
        };
        loadCurrentGroupResources(group.id);
      } else {
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
      loadAvailableResources();
    }
  },
  { immediate: true },
);

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

  for (const serverId of serverIds) {
    try {
      await patchServer(serverId, { groupId });
      successes.push({ type: 'server', id: serverId });
    } catch (error) {
      errors.push({ type: 'server', id: serverId, error });
    }
  }

  for (const vmId of vmIds) {
    try {
      await patchVm(vmId, { groupId });
      successes.push({ type: 'vm', id: vmId });
    } catch (error) {
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

  for (const serverId of serverIds) {
    try {
      await patchServer(serverId, { groupId: null });
      successes.push({ type: 'server', id: serverId });
    } catch (error) {
      errors.push({ type: 'server', id: serverId, error });
    }
  }

  for (const vmId of vmIds) {
    try {
      await patchVm(vmId, { groupId: null });
      successes.push({ type: 'vm', id: vmId });
    } catch (error) {
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
      const updatePayload: UpdateGroupDto = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || undefined,
      };
      group = await updateGroup(props.group!.id, updatePayload);

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

      if (serversToAdd.length > 0 || vmsToAdd.length > 0) {
        await assignResourcesToGroup(group.id, serversToAdd, vmsToAdd);
      }

      if (serversToRemove.length > 0 || vmsToRemove.length > 0) {
        await unassignResourcesFromGroup(serversToRemove, vmsToRemove);
      }

      toast.success(t('groups.updateSuccess'));
    } else {
      const createPayload: CreateGroupDto = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || undefined,
        type: formData.value.type,
      };
      group = await createGroup(createPayload);

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
            t('groups.form.partialAssignmentError', {
              assigned: successes.length,
              failed: errors.length,
            }),
          );
        } else if (successes.length > 0) {
          toast.success(
            t('groups.form.allResourcesAssigned', { count: successes.length }),
          );
        }
      }

      toast.success(t('groups.createSuccess'));
    }

    emit('success', group);
  } catch (error) {
    toast.error(
      isEditing.value ? t('groups.updateError') : t('groups.createError'),
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
