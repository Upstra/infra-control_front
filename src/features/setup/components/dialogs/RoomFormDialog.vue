<template>
  <Modal :open="open" @close="$emit('update:open', false)">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{
            mode === 'add'
              ? t('setup_room.add_title')
              : t('setup_room.edit_title')
          }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('setup_room.name_label') }} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              :class="[
                'mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white pr-10',
                nameValidation.isValid && !nameValidation.isLoading
                  ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                  : !nameValidation.isValid
                    ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
              ]"
              :placeholder="t('setup_room.name_placeholder')"
              @input="handleNameValidation"
              @blur="handleNameValidation"
            />
            <div
              class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <Loader
                v-if="nameValidation.isLoading"
                :size="16"
                class="animate-spin text-gray-400"
              />
              <CheckCircle
                v-else-if="nameValidation.isValid && form.name.trim()"
                :size="16"
                class="text-green-500"
              />
              <AlertCircle
                v-else-if="!nameValidation.isValid"
                :size="16"
                class="text-red-500"
              />
            </div>
          </div>
          <p
            v-if="nameValidation.error"
            class="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {{ nameValidation.error }}
          </p>
        </div>

        <div
          class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"
        >
          <button
            type="submit"
            :disabled="!canSave"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
import { reactive, watch, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckCircle, AlertCircle, Loader } from 'lucide-vue-next';
import Modal from '@/shared/components/Modal.vue';
import { useRealTimeValidation } from '../../composables/useRealTimeValidation';
import type { BulkRoomDto } from '../../types';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  room?: BulkRoomDto;
  rooms?: BulkRoomDto[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [room: BulkRoomDto];
}>();

const { t } = useI18n();

const { validateName: validateNameRealTime } = useRealTimeValidation(
  props.rooms,
);

const form = reactive({
  name: '',
});

const nameValidation = ref({ isValid: true, isLoading: false, error: '' });

const canSave = computed(() => {
  return form.name && nameValidation.value.isValid;
});

const handleNameValidation = async () => {
  if (!form.name.trim()) {
    nameValidation.value = { isValid: true, isLoading: false, error: '' };
    return;
  }

  nameValidation.value.isLoading = true;
  const result = await validateNameRealTime(form.name, 'room');
  nameValidation.value = {
    isValid: result.isValid,
    isLoading: result.isLoading,
    error: result.error || '',
  };
};

watch(
  () => props.room,
  (newRoom) => {
    if (newRoom && props.mode === 'edit') {
      form.name = newRoom.name || '';
    } else {
      form.name = '';
    }
    nameValidation.value = { isValid: true, isLoading: false, error: '' };
  },
  { immediate: true },
);

const handleSubmit = () => {
  const roomData: BulkRoomDto = {
    name: form.name,
  };

  emit('save', roomData);
  emit('update:open', false);
};
</script>
