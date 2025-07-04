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
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
              >
                <DialogTitle
                  class="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {{ group?.name }}
                </DialogTitle>
                <button
                  @click="close"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div class="px-6 py-4">
                <div class="space-y-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <span
                          :class="[
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getPriorityClass(group?.priority || 5),
                          ]"
                        >
                          {{ $t('groups.priority') }}: {{ group?.priority }}
                        </span>
                        <span
                          :class="[
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            group?.type === 'server'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                          ]"
                        >
                          <ServerIcon
                            v-if="group?.type === 'server'"
                            class="w-3 h-3 mr-1"
                          />
                          <CpuChipIcon v-else class="w-3 h-3 mr-1" />
                          {{
                            group?.type === 'server'
                              ? $t('groups.serverGroup')
                              : $t('groups.vmGroup')
                          }}
                        </span>
                        <span
                          v-if="group?.cascade"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                        >
                          <ArrowsRightLeftIcon class="w-3 h-3 mr-1" />
                          {{ $t('groups.cascade') }}
                        </span>
                      </div>
                      <p
                        v-if="group?.description"
                        class="text-gray-600 dark:text-gray-400"
                      >
                        {{ group.description }}
                      </p>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        @click="handleEdit"
                        class="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        <PencilSquareIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="handleStart"
                        class="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      >
                        <PlayIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="handleStop"
                        class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <StopIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="handleDelete"
                        class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <!-- Metadata -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <dt
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        {{ $t('groups.room') }}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {{ roomName || $t('groups.noRoom') }}
                      </dd>
                    </div>
                    <div>
                      <dt
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        {{
                          group?.type === 'server'
                            ? $t('groups.serverCount')
                            : $t('groups.vmCount')
                        }}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {{ resources.length }}
                      </dd>
                    </div>
                  </div>

                  <!-- Resources Section -->
                  <div>
                    <h3
                      class="text-lg font-medium text-gray-900 dark:text-white mb-4"
                    >
                      {{
                        group?.type === 'server'
                          ? $t('groups.servers')
                          : $t('groups.vms')
                      }}
                    </h3>

                    <div
                      v-if="resources.length === 0"
                      class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <ServerIcon
                        v-if="group?.type === 'server'"
                        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
                      />
                      <CpuChipIcon
                        v-else
                        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
                      />
                      <p class="text-gray-600 dark:text-gray-400">
                        {{
                          group?.type === 'server'
                            ? $t('groups.noServersInGroup')
                            : $t('groups.noVmsInGroup')
                        }}
                      </p>
                    </div>

                    <div
                      v-else
                      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <div
                        v-for="resource in resources"
                        :key="resource.id"
                        class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex-1 min-w-0">
                            <h4
                              class="text-sm font-medium text-gray-900 dark:text-white truncate"
                            >
                              {{ resource.name }}
                            </h4>
                            <p
                              class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                            >
                              ID: {{ resource.id }}
                            </p>
                          </div>
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
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  @click="close"
                  class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {{ $t('common.close') }}
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
import { computed } from 'vue';
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
  ArrowsRightLeftIcon,
  PencilSquareIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import type { Group } from '../types';
import { useRoomStore } from '@/features/rooms/store';

interface Props {
  group: Group | null;
  resources: Array<{ id: string; name: string; state: 'active' | 'inactive' }>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  edit: [group: Group];
  delete: [group: Group];
  start: [group: Group];
  stop: [group: Group];
}>();

const { t: $t } = useI18n();
const roomStore = useRoomStore();

const roomName = computed(() => {
  if (!props.group?.roomId) return null;
  const room = roomStore.list?.find((r: any) => r.id === props.group?.roomId);
  return room?.name;
});

const getPriorityClass = (priority: number) => {
  if (priority >= 8)
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (priority >= 5)
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
};

const close = () => emit('close');
const handleEdit = () => props.group && emit('edit', props.group);
const handleDelete = () => props.group && emit('delete', props.group);
const handleStart = () => props.group && emit('start', props.group);
const handleStop = () => props.group && emit('stop', props.group);
</script>
