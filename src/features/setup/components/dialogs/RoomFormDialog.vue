<template>
  <Modal :open="open" @close="$emit('update:open', false)">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{ mode === 'add' ? t('setup_room.add_title') : t('setup_room.edit_title') }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('setup_room.name_label') }}
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            :placeholder="t('setup_room.name_placeholder')"
          />
        </div>

        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('setup_room.location_label') }}
          </label>
          <textarea
            id="location"
            v-model="form.location"
            rows="2"
            required
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            :placeholder="t('setup_room.location_placeholder')"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="capacity" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_room.capacity_label') }}
            </label>
            <input
              id="capacity"
              v-model.number="form.capacity"
              type="number"
              min="1"
              max="1000"
              required
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label for="coolingType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_room.cooling_label') }}
            </label>
            <select
              id="coolingType"
              v-model="form.coolingType"
              required
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="air">{{ t('setup_room.cooling_air') }}</option>
              <option value="liquid">{{ t('setup_room.cooling_liquid') }}</option>
              <option value="free">{{ t('setup_room.cooling_free') }}</option>
              <option value="hybrid">{{ t('setup_room.cooling_hybrid') }}</option>
            </select>
          </div>
        </div>

        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="submit"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
          >
            {{ mode === 'add' ? t('common.add') : t('common.save') }}
          </button>
          <button
            type="button"
            @click="$emit('update:open', false)"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/shared/components/Modal.vue';
import type { BulkRoomDto } from '../../types';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  room?: BulkRoomDto | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [room: BulkRoomDto];
}>();

const { t } = useI18n();

const form = reactive<BulkRoomDto>({
  name: '',
  location: '',
  capacity: 10,
  coolingType: 'air'
});

watch(() => props.room, (newRoom) => {
  if (newRoom && props.mode === 'edit') {
    form.name = newRoom.name || '';
    form.location = newRoom.location || '';
    form.capacity = newRoom.capacity || 10;
    form.coolingType = newRoom.coolingType || 'air';
  } else {
    form.name = '';
    form.location = '';
    form.capacity = 10;
    form.coolingType = 'air';
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('save', { ...form });
};
</script>