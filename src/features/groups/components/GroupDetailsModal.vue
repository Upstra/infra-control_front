<template>
  <TransitionRoot :show="!!group" as="template">
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
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-border"
              >
                <DialogTitle
                  class="text-xl font-semibold text-text-strong"
                >
                  {{ group?.name }}
                </DialogTitle>
                <button
                  @click="close"
                  class="text-text-muted hover:text-text-muted transition-colors"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div class="flex h-[600px]">
                <div
                  class="w-1/3 px-6 py-4 border-r border-border"
                >
                  <div class="space-y-6">
                    <div>
                      <div class="flex items-center gap-3 mb-3">
                        <div
                          :class="[
                            'inline-flex items-center justify-center w-12 h-12 rounded-lg',
                            group?.type === 'SERVER'
                              ? 'bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text'
                              : 'bg-purple-100 text-purple-600',
                          ]"
                        >
                          <component
                            :is="
                              group?.type === 'SERVER'
                                ? ServerIcon
                                : CpuChipIcon
                            "
                            class="w-6 h-6"
                          />
                        </div>
                        <div>
                          <p class="text-xs text-text-muted">
                            {{ t('groups.form.type') }}
                          </p>
                          <p class="font-medium text-text-strong">
                            {{
                              group?.type === 'SERVER'
                                ? t('groups.serverGroup')
                                : t('groups.vmGroup')
                            }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div v-if="group?.description">
                      <h4
                        class="text-sm font-medium text-text mb-2"
                      >
                        {{ t('groups.form.description') }}
                      </h4>
                      <p class="text-sm text-text">
                        {{ group.description }}
                      </p>
                    </div>

                    <div class="space-y-4">
                      <div
                        class="bg-surface-sunken rounded-lg p-4"
                      >
                        <div class="flex items-center justify-between">
                          <span
                            class="text-sm text-text"
                          >
                            {{
                              group?.type === 'SERVER'
                                ? t('groups.totalServers')
                                : t('groups.totalVms')
                            }}
                          </span>
                          <span
                            class="text-2xl font-bold text-text-strong"
                          >
                            {{
                              loadingResources ? '...' : groupResources.length
                            }}
                          </span>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <div
                          class="bg-success-surface rounded-lg p-3"
                        >
                          <div class="flex items-center justify-between">
                            <span
                              class="text-xs text-success-text"
                            >
                              {{ t('groups.activeResources') }}
                            </span>
                            <span
                              class="text-lg font-semibold text-success-text"
                            >
                              {{ activeResourcesCount }}
                            </span>
                          </div>
                        </div>
                        <div
                          class="bg-surface-raised rounded-lg p-3"
                        >
                          <div class="flex items-center justify-between">
                            <span
                              class="text-xs text-text"
                            >
                              {{ t('groups.inactiveResources') }}
                            </span>
                            <span
                              class="text-lg font-semibold text-text"
                            >
                              {{ inactiveResourcesCount }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <button
                        @click="handleEdit"
                        class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border-control rounded-lg text-text hover:bg-surface-sunken transition-colors"
                      >
                        <PencilSquareIcon class="w-4 h-4" />
                        {{ t('common.edit') }}
                      </button>

                      <div class="grid grid-cols-2 gap-3">
                        <button
                          @click="handleStart"
                          class="flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success text-white rounded-lg transition-colors"
                        >
                          <PlayIcon class="w-4 h-4" />
                          {{ t('common.start') }}
                        </button>
                        <button
                          @click="handleStop"
                          class="flex items-center justify-center gap-2 px-4 py-2 bg-danger-solid hover:bg-danger-solid text-white rounded-lg transition-colors"
                        >
                          <StopIcon class="w-4 h-4" />
                          {{ t('common.stop') }}
                        </button>
                      </div>

                      <button
                        @click="handleDelete"
                        class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-danger-border rounded-lg text-danger-text hover:bg-danger-surface transition-colors"
                      >
                        <TrashIcon class="w-4 h-4" />
                        {{ t('common.delete') }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex-1 px-6 py-4">
                  <div class="h-full flex flex-col">
                    <div class="mb-4">
                      <h3
                        class="text-lg font-semibold text-text-strong"
                      >
                        {{
                          group?.type === 'SERVER'
                            ? t('groups.assignedServers')
                            : t('groups.assignedVms')
                        }}
                      </h3>
                    </div>

                    <div
                      v-if="loadingResources"
                      class="flex-1 flex items-center justify-center"
                    >
                      <div class="text-center">
                        <div
                          class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"
                        ></div>
                        <p class="text-sm text-text-muted">
                          {{ t('common.loading') }}
                        </p>
                      </div>
                    </div>

                    <div
                      v-else-if="groupResources.length === 0"
                      class="flex-1 flex items-center justify-center"
                    >
                      <div class="text-center">
                        <component
                          :is="
                            group?.type === 'SERVER' ? ServerIcon : CpuChipIcon
                          "
                          class="mx-auto h-12 w-12 text-text-muted mb-4"
                        />
                        <p class="text-text mb-4">
                          {{
                            group?.type === 'SERVER'
                              ? t('groups.noServersInGroup')
                              : t('groups.noVmsInGroup')
                          }}
                        </p>
                        <button
                          @click="handleEdit"
                          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg transition-colors"
                        >
                          <PlusIcon class="w-4 h-4" />
                          {{ t('groups.addResources') }}
                        </button>
                      </div>
                    </div>

                    <div v-else class="flex-1 overflow-y-auto">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          v-for="resource in groupResources"
                          :key="resource.id"
                          class="group relative p-4 bg-surface rounded-lg border border-border hover:border-border-control transition-colors"
                        >
                          <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                              <h4
                                class="text-sm font-medium text-text-strong truncate"
                              >
                                {{ resource.name }}
                              </h4>
                              <div
                                class="mt-1 flex items-center gap-3 text-xs text-text-muted"
                              >
                                <span v-if="resource.ip">{{
                                  resource.ip
                                }}</span>
                                <span
                                  v-if="resource.roomName"
                                  class="flex items-center gap-1"
                                >
                                  <BuildingOffice2Icon class="w-3 h-3" />
                                  {{ resource.roomName }}
                                </span>
                              </div>
                            </div>
                            <div class="flex items-center gap-2">
                              <span
                                :class="[
                                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                  resource.state === 'active' ||
                                  resource.state === 'running'
                                    ? 'bg-success-surface text-success-text'
                                    : 'bg-surface-raised text-text-strong',
                                ]"
                              >
                                {{ resource.state || 'unknown' }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center justify-end gap-3 px-6 py-4 bg-surface-sunken border-t border-border"
              >
                <button
                  @click="close"
                  class="px-4 py-2 text-text hover:text-text-strong transition-colors"
                >
                  {{ t('common.close') }}
                </button>
              </div>
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
import {
  XMarkIcon,
  ServerIcon,
  CpuChipIcon,
  PencilSquareIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  PlusIcon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline';
import type { GroupResponseDto } from '../types';
import { useServerStore } from '@/features/servers/store';
import { fetchUvms } from '@/features/vms/api';
import { useRoomStore } from '@/features/rooms/store';

interface Props {
  group: GroupResponseDto | null;
  resources?: Array<{ id: string; name: string; state: 'active' | 'inactive' }>;
}

interface ResourceWithDetails {
  id: string;
  name: string;
  state?: string;
  ip?: string;
  roomId?: string;
  roomName?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  edit: [group: GroupResponseDto];
  delete: [group: GroupResponseDto];
  start: [group: GroupResponseDto];
  stop: [group: GroupResponseDto];
}>();

const { t } = useI18n();
const serverStore = useServerStore();
const roomStore = useRoomStore();

const groupResources = ref<ResourceWithDetails[]>([]);
const loadingResources = ref(false);

const activeResourcesCount = computed(() => {
  return groupResources.value.filter(
    (r) => r.state === 'active' || r.state === 'running',
  ).length;
});

const inactiveResourcesCount = computed(() => {
  return groupResources.value.length - activeResourcesCount.value;
});

const loadGroupResources = async () => {
  if (!props.group) return;

  loadingResources.value = true;
  try {
    if (props.group.type === 'SERVER') {
      await serverStore.fetchServers();
      const servers = serverStore.list.filter(
        (server) => server.groupId === props.group!.id,
      );

      groupResources.value = servers.map((server) => ({
        id: server.id,
        name: server.name,
        state: server.state,
        ip: server.ip,
        roomId: server.roomId,
        roomName: roomStore.list.find((r) => r.id === server.roomId)?.name,
      }));
    } else {
      const vmsResponse = await fetchUvms();
      const vms = Array.isArray(vmsResponse.items) ? vmsResponse.items : [];
      const groupVms = vms.filter((vm: any) => vm.groupId === props.group!.id);

      groupResources.value = groupVms.map((vm: any) => ({
        id: vm.id,
        name: vm.name,
        state: vm.state,
      }));
    }
  } catch (error) {
    groupResources.value = [];
  } finally {
    loadingResources.value = false;
  }
};

watch(
  () => props.group,
  (newGroup) => {
    if (newGroup) {
      loadGroupResources();
    }
  },
  { immediate: true },
);

onMounted(async () => {
  if (roomStore.list.length === 0) {
    await roomStore.fetchRooms();
  }
});

const close = () => emit('close');
const handleEdit = () => props.group && emit('edit', props.group);
const handleDelete = () => props.group && emit('delete', props.group);
const handleStart = () => props.group && emit('start', props.group);
const handleStop = () => props.group && emit('stop', props.group);
</script>
