<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div
        class="fixed inset-0 bg-black opacity-50"
        @click="$emit('close')"
      ></div>

      <div
        class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('groups.createGroup') }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('groups.form.name') }}
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('groups.form.namePlaceholder')"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('groups.form.description') }}
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('groups.form.descriptionPlaceholder')"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('groups.form.type') }}
            </label>
            <select
              v-model="formData.type"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="server">{{ $t('groups.serverGroup') }}</option>
              <option value="vm">{{ $t('groups.vmGroup') }}</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('groups.form.priority') }}
            </label>
            <select
              v-model.number="formData.priority"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option :value="1">
                {{ $t('groups.priority1') }} - {{ $t('groups.priorityDesc1') }}
              </option>
              <option :value="2">
                {{ $t('groups.priority2') }} - {{ $t('groups.priorityDesc2') }}
              </option>
              <option :value="3">
                {{ $t('groups.priority3') }} - {{ $t('groups.priorityDesc3') }}
              </option>
              <option :value="4">
                {{ $t('groups.priority4') }} - {{ $t('groups.priorityDesc4') }}
              </option>
            </select>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="formData.cascade"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ $t('groups.form.cascade') }}
              </span>
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ $t('groups.form.cascadeHelp') }}
            </p>
          </div>

          <div v-if="rooms.length > 0">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('groups.form.room') }}
            </label>
            <select
              v-model="formData.roomId"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{{ $t('groups.form.noRoom') }}</option>
              <option v-for="room in rooms" :key="room.id" :value="room.id">
                {{ room.name }}
              </option>
            </select>
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="!isValid"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {{ $t('common.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CreateGroupPayload, GroupType, GroupPriority } from '../types';
import { useRoomStore } from '@/features/rooms/store';

const emit = defineEmits<{
  close: [];
  create: [payload: CreateGroupPayload];
}>();

const roomStore = useRoomStore();
const rooms = computed(() => roomStore.list);

const formData = ref({
  name: '',
  description: '',
  type: 'server' as GroupType,
  priority: 2 as GroupPriority,
  cascade: true,
  roomId: '',
  resourceIds: [] as string[],
});

const isValid = computed(() => {
  return formData.value.name.trim().length > 0;
});

const handleSubmit = () => {
  if (!isValid.value) return;

  const payload: CreateGroupPayload = {
    ...formData.value,
    roomId: formData.value.roomId || undefined,
  };

  emit('create', payload);
};
</script>
