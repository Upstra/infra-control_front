<template>
  <Modal :open="open" @close="$emit('update:open', false)" :size="'lg'">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{ mode === 'add' ? t('setup_ups.add_title') : t('setup_ups.edit_title') }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="roomId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('setup_ups.room_label') }}
          </label>
          <select
            id="roomId"
            v-model="form.roomId"
            required
            :disabled="rooms.length === 0"
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="" disabled>{{ t('setup_ups.select_room_placeholder') }}</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('setup_ups.name_label') }}
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            :placeholder="t('setup_ups.name_placeholder')"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="brand" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_ups.brand_label') }}
            </label>
            <select
              id="brand"
              v-model="form.brand"
              required
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">{{ t('setup_ups.brand_select') }}</option>
              <option value="APC">APC</option>
              <option value="Eaton">Eaton</option>
              <option value="Legrand">Legrand</option>
              <option value="Schneider">Schneider Electric</option>
              <option value="Other">{{ t('setup_ups.brand_other') }}</option>
            </select>
          </div>

          <div>
            <label for="model" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_ups.model_label') }}
            </label>
            <input
              id="model"
              v-model="form.model"
              type="text"
              required
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              :placeholder="t('setup_ups.model_placeholder')"
            />
          </div>
        </div>

        <div>
          <label for="capacity" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('setup_ups.capacity_label') }}
          </label>
          <input
            id="capacity"
            v-model.number="form.capacity"
            type="number"
            min="0"
            required
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            :placeholder="t('setup_ups.capacity_placeholder')"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('setup_ups.capacity_hint') }}</p>
        </div>

        <div>
          <label for="ip" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('setup_ups.ip_label') }}
          </label>
          <div class="flex gap-2">
            <input
              id="ip"
              v-model="form.ip"
              type="text"
              class="flex-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              :placeholder="t('setup_ups.ip_placeholder')"
              @blur="validateIp"
            />
            <button
              type="button"
              @click="testConnection"
              :disabled="!form.ip || isTestingConnection"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wifi :size="16" :class="{'animate-pulse': isTestingConnection}" />
              <span class="ml-2">{{ t('setup_ups.test_connection') }}</span>
            </button>
          </div>
          <p v-if="connectionStatus" class="mt-1 text-xs" :class="{
            'text-green-600 dark:text-green-400': connectionStatus === 'success',
            'text-red-600 dark:text-red-400': connectionStatus === 'error'
          }">
            {{ connectionMessage }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="login" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_ups.login_label') }}
            </label>
            <input
              id="login"
              v-model="form.login"
              type="text"
              autocomplete="off"
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              :placeholder="t('setup_ups.login_placeholder')"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_ups.password_label') }}
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              :placeholder="t('setup_ups.password_placeholder')"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="grace_on" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_ups.grace_on_label') }}
            </label>
            <input
              id="grace_on"
              v-model.number="form.gracePeriodOn"
              type="number"
              min="0"
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              :placeholder="t('setup_ups.grace_on_placeholder')"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('setup_ups.grace_on_hint') }}</p>
          </div>

          <div>
            <label for="grace_off" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('setup_ups.grace_off_label') }}
            </label>
            <input
              id="grace_off"
              v-model.number="form.gracePeriodOff"
              type="number"
              min="0"
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              :placeholder="t('setup_ups.grace_off_placeholder')"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('setup_ups.grace_off_hint') }}</p>
          </div>
        </div>

        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
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
import { Wifi } from 'lucide-vue-next';
import Modal from '@/components/Modal.vue';
import { upsApi } from '@/features/ups/api';
import type { UpsCreationDto } from '../../types';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  ups?: any;
  rooms: any[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [ups: UpsCreationDto & { status?: string }];
}>();

const { t } = useI18n();

const form = reactive({
  name: '',
  brand: '',
  model: '',
  capacity: 3000,
  roomId: '',
  ip: '',
  login: '',
  password: '',
  gracePeriodOn: 60,
  gracePeriodOff: 30
});

const isTestingConnection = ref(false);
const connectionStatus = ref<'success' | 'error' | null>(null);
const connectionMessage = ref('');
const ipTested = ref(false);

const canSave = computed(() => {
  return form.name && form.roomId && form.brand && form.model && form.capacity > 0 && (!form.ip || ipTested.value);
});

watch(() => props.ups, (newUps) => {
  if (newUps && props.mode === 'edit') {
    form.name = newUps.name || '';
    form.brand = newUps.brand || '';
    form.model = newUps.model || '';
    form.capacity = newUps.capacity || 3000;
    form.roomId = newUps.roomId || '';
    form.ip = newUps.ip || '';
    form.login = newUps.login || '';
    form.password = newUps.password || '';
    form.gracePeriodOn = newUps.gracePeriodOn || 60;
    form.gracePeriodOff = newUps.gracePeriodOff || 30;
    ipTested.value = !!newUps.id;
  } else {
    Object.assign(form, {
      name: '',
      brand: '',
      model: '',
      capacity: 3000,
      roomId: props.rooms[0]?.id || '',
      ip: '',
      login: '',
      password: '',
      gracePeriodOn: 60,
      gracePeriodOff: 30
    });
    ipTested.value = false;
  }
  connectionStatus.value = null;
  connectionMessage.value = '';
}, { immediate: true });

const validateIp = () => {
  if (form.ip && form.ip !== props.ups?.ip) {
    ipTested.value = false;
    connectionStatus.value = null;
  }
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
      connectionMessage.value = t('setup_ups.connection_success', { time: response.responseTime });
      ipTested.value = true;
    } else {
      connectionStatus.value = 'error';
      connectionMessage.value = response.error || t('setup_ups.connection_failed');
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
    brand: form.brand,
    model: form.model,
    capacity: form.capacity,
    roomId: form.roomId
  };

  if (form.ip) {
    Object.assign(upsData, {
      ip: form.ip,
      login: form.login,
      password: form.password,
      gracePeriodOn: form.gracePeriodOn,
      gracePeriodOff: form.gracePeriodOff,
      status: ipTested.value ? 'connected' : 'pending'
    });
  }

  emit('save', upsData);
};
</script>