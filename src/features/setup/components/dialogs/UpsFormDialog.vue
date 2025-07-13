<template>
  <Modal :open="open" @close="$emit('update:open', false)" :size="'lg'">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{
            mode === 'add'
              ? t('setup_ups.add_title')
              : t('setup_ups.edit_title')
          }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label
            for="roomId"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('setup_ups.room_label') }}
          </label>
          <select
            id="roomId"
            v-model="form.roomId"
            required
            :disabled="rooms.length === 0"
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="" disabled>
              {{ t('setup_ups.select_room_placeholder') }}
            </option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('setup_ups.name_label') }}
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
              :placeholder="t('setup_ups.name_placeholder')"
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

        <div>
          <label
            for="ip"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ t('setup_ups.ip_label') }}
          </label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                id="ip"
                v-model="form.ip"
                type="text"
                :class="[
                  'block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white pr-10',
                  ipValidation.isValid && !ipValidation.isLoading
                    ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                    : !ipValidation.isValid
                      ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                ]"
                :placeholder="t('setup_ups.ip_placeholder')"
                @input="handleIpValidation"
                @blur="handleIpValidation"
              />
              <div
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <Loader
                  v-if="ipValidation.isLoading"
                  :size="16"
                  class="animate-spin text-gray-400"
                />
                <CheckCircle
                  v-else-if="ipValidation.isValid && form.ip.trim()"
                  :size="16"
                  class="text-green-500"
                />
                <AlertCircle
                  v-else-if="!ipValidation.isValid"
                  :size="16"
                  class="text-red-500"
                />
              </div>
            </div>
            <button
              type="button"
              @click="testConnection"
              :disabled="!form.ip || isTestingConnection"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wifi
                :size="16"
                :class="{ 'animate-pulse': isTestingConnection }"
              />
              <span class="ml-2">{{ t('setup_ups.test_connection') }}</span>
            </button>
          </div>
          <p
            v-if="ipValidation.error"
            class="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {{ ipValidation.error }}
          </p>
          <p
            v-else-if="connectionStatus"
            class="mt-1 text-xs"
            :class="{
              'text-green-600 dark:text-green-400':
                connectionStatus === 'success',
              'text-red-600 dark:text-red-400': connectionStatus === 'error',
            }"
          >
            {{ connectionMessage }}
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
import { reactive, watch, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Wifi, CheckCircle, AlertCircle, Loader } from 'lucide-vue-next';
import Modal from '@/shared/components/Modal.vue';
import { upsApi } from '@/features/ups/api';
import { useRealTimeValidation } from '../../composables/useRealTimeValidation';
import type { UpsCreationDto } from '../../types';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  ups?: any;
  rooms: any[];
  upsList?: any[];
  serversList?: any[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [ups: UpsCreationDto & { status?: string }];
}>();

const { t } = useI18n();

const allResources = computed(() => [
  ...(props.upsList || []),
  ...(props.serversList || []),
]);

const { validateIp: validateIpRealTime, validateName: validateNameRealTime } =
  useRealTimeValidation(allResources.value);

const form = reactive({
  name: '',
  roomId: '',
  ip: '',
});

const isTestingConnection = ref(false);
const connectionStatus = ref<'success' | 'error' | null>(null);
const connectionMessage = ref('');
const ipTested = ref(false);

const nameValidation = ref({ isValid: true, isLoading: false, error: '' });
const ipValidation = ref({ isValid: true, isLoading: false, error: '' });

const canSave = computed(() => {
  return (
    form.name &&
    form.roomId &&
    nameValidation.value.isValid &&
    ipValidation.value.isValid
  );
});

watch(
  () => props.ups,
  (newUps) => {
    if (newUps && props.mode === 'edit') {
      form.name = newUps.name || '';
      form.roomId = newUps.roomId || '';
      form.ip = newUps.ip || '';
      ipTested.value = !!newUps.id;
    } else {
      Object.assign(form, {
        name: '',
        roomId: props.rooms[0]?.id || '',
        ip: '',
      });
      ipTested.value = false;
    }
    connectionStatus.value = null;
    connectionMessage.value = '';
    nameValidation.value = { isValid: true, isLoading: false, error: '' };
    ipValidation.value = { isValid: true, isLoading: false, error: '' };
  },
  { immediate: true },
);

const handleNameValidation = async () => {
  if (!form.name.trim()) {
    nameValidation.value = { isValid: true, isLoading: false, error: '' };
    return;
  }

  nameValidation.value.isLoading = true;
  const result = await validateNameRealTime(form.name, 'ups');
  nameValidation.value = {
    isValid: result.isValid,
    isLoading: result.isLoading,
    error: result.error || '',
  };
};

const handleIpValidation = async () => {
  if (!form.ip.trim()) {
    ipValidation.value = { isValid: true, isLoading: false, error: '' };
    return;
  }

  ipValidation.value.isLoading = true;
  const result = await validateIpRealTime(form.ip);
  ipValidation.value = {
    isValid: result.isValid,
    isLoading: result.isLoading,
    error: result.error || '',
  };
};

const testConnection = async () => {
  if (!form.ip) return;

  isTestingConnection.value = true;
  connectionStatus.value = null;

  try {
    const tempId = props.ups?.id || 'temp-' + Date.now();
    const response = await upsApi.ping(tempId, { ip: form.ip });

    if (response.accessible) {
      connectionStatus.value = 'success';
      connectionMessage.value = t('setup_ups.connection_success', {
        time: response.responseTime,
      });
      ipTested.value = true;
    } else {
      connectionStatus.value = 'error';
      connectionMessage.value =
        response.error || t('setup_ups.connection_failed');
      ipTested.value = false;
    }
  } catch (error: any) {
    connectionStatus.value = 'error';
    connectionMessage.value = error.message || t('setup_ups.connection_error');
    ipTested.value = false;
  } finally {
    isTestingConnection.value = false;
  }
};

const handleSubmit = () => {
  const upsData: UpsCreationDto & { status?: string } = {
    name: form.name,
    roomId: form.roomId,
    ip: form.ip || '',
  };

  if (form.ip && ipTested.value) {
    upsData.status = 'connected';
  }

  emit('save', upsData);
};
</script>
