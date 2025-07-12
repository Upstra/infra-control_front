<template>
  <Modal :open="open" @close="$emit('update:open', false)" :size="'xl'">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{
            mode === 'add'
              ? t('setup_server.add_title')
              : t('setup_server.edit_title')
          }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ t('setup_server.location_title') }}
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="roomId"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('setup_server.room_label') }}
                <span class="text-red-500">*</span>
              </label>
              <select
                id="roomId"
                v-model="form.roomId"
                required
                :disabled="rooms.length === 0"
                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>
                  {{ t('setup_server.select_room') }}
                </option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                  {{ room.name }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="upsId"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('setup_server.ups_label') }}
              </label>
              <select
                id="upsId"
                v-model="form.upsId"
                :disabled="filteredUpsList.length === 0"
                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">
                  {{ t('setup_server.no_ups_assigned') }}
                </option>
                <option
                  v-for="ups in filteredUpsList"
                  :key="ups.id"
                  :value="ups.id"
                >
                  {{ ups.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ t('setup_server.general_title') }}
          </h4>
          <div class="space-y-4">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('setup_server.name_label') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                :placeholder="t('setup_server.name_placeholder')"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label
                  for="type"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.type_label') }}
                </label>
                <select
                  id="type"
                  v-model="form.type"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="physical">
                    {{ t('setup_server.type_physical') }}
                  </option>
                  <option value="virtual">
                    {{ t('setup_server.type_virtual') }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="state"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.state_label') }}
                </label>
                <select
                  id="state"
                  v-model="form.state"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">
                    {{ t('setup_server.state_on') }}
                  </option>
                  <option value="inactive">
                    {{ t('setup_server.state_off') }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="priority"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.priority_label') }}
                </label>
                <input
                  id="priority"
                  v-model.number="form.priority"
                  type="number"
                  min="1"
                  max="10"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="grace_on"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.grace_on_label') }}
                </label>
                <input
                  id="grace_on"
                  v-model.number="form.grace_period_on"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.grace_on_placeholder')"
                />
              </div>

              <div>
                <label
                  for="grace_off"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.grace_off_label') }}
                </label>
                <input
                  id="grace_off"
                  v-model.number="form.grace_period_off"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.grace_off_placeholder')"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ t('setup_server.access_title') }}
          </h4>
          <div class="space-y-4">
            <div>
              <label
                for="ip"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('setup_server.ip_label') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                id="ip"
                v-model="form.ip"
                type="text"
                :placeholder="t('setup_server.ip_placeholder')"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                for="adminUrl"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('setup_server.admin_url_label') }}
              </label>
              <input
                id="adminUrl"
                v-model="form.adminUrl"
                type="url"
                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                :placeholder="t('setup_server.admin_url_placeholder')"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="login"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.os_login_label') }}
                </label>
                <input
                  id="login"
                  v-model="form.login"
                  type="text"
                  autocomplete="off"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.os_login_placeholder')"
                />
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.os_password_label') }}
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  autocomplete="new-password"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.os_password_placeholder')"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="form.type === 'physical'">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ t('setup_server.ilo_title') }}
          </h4>
          <div class="space-y-4">
            <div>
              <label
                for="ilo_name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('setup_server.ilo_name_label') }}
              </label>
              <input
                id="ilo_name"
                v-model="form.ilo_name"
                type="text"
                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                :placeholder="t('setup_server.ilo_name_placeholder')"
              />
            </div>

            <div>
              <label
                for="ilo_ip"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('setup_server.ilo_ip_label') }}
              </label>
              <input
                id="ilo_ip"
                v-model="form.ilo_ip"
                type="text"
                :placeholder="t('setup_server.ilo_ip_placeholder')"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="ilo_login"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.ilo_login_label') }}
                </label>
                <input
                  id="ilo_login"
                  v-model="form.ilo_login"
                  type="text"
                  autocomplete="off"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.ilo_login_placeholder')"
                />
              </div>

              <div>
                <label
                  for="ilo_password"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.ilo_password_label') }}
                </label>
                <input
                  id="ilo_password"
                  v-model="form.ilo_password"
                  type="password"
                  autocomplete="new-password"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.ilo_password_placeholder')"
                />
              </div>
            </div>
          </div>
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
import Modal from '@/shared/components/Modal.vue';
// import ConnectivityTest from '@/shared/components/ConnectivityTest.vue';
import type { ServerCreationDto } from '../../types';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  server?: any;
  rooms: any[];
  upsList: any[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [server: ServerCreationDto & { status?: string }];
}>();

const { t } = useI18n();

const form = reactive({
  name: '',
  state: 'active',
  grace_period_on: 30,
  grace_period_off: 30,
  adminUrl: '',
  ip: '',
  login: '',
  password: '',
  type: 'physical',
  priority: 1,
  roomId: '',
  upsId: '',
  ilo_name: '',
  ilo_ip: '',
  ilo_login: '',
  ilo_password: '',
});

const serverIpStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle');
const iloIpStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle');
// const tempServerId = computed(() => props.server?.id || 'new');

const filteredUpsList = computed(() => {
  if (!form.roomId) return [];
  return props.upsList.filter((ups) => ups.roomId === form.roomId);
});

const canSave = computed(() => {
  const hasRequiredFields = form.name && form.roomId && form.ip;
  const hasValidServerIp = serverIpStatus.value === 'success';
  const hasValidIloIp = !form.ilo_ip || iloIpStatus.value === 'success';

  return hasRequiredFields && hasValidServerIp && hasValidIloIp;
});

watch(
  () => props.server,
  (newServer) => {
    if (newServer && props.mode === 'edit') {
      Object.assign(form, {
        name: newServer.name || '',
        state: newServer.state || 'active',
        grace_period_on: newServer.grace_period_on || 30,
        grace_period_off: newServer.grace_period_off || 30,
        adminUrl: newServer.adminUrl || '',
        ip: newServer.ip || '',
        login: newServer.login || '',
        password: newServer.password || '',
        type: newServer.type || 'physical',
        priority: newServer.priority || 1,
        roomId: newServer.roomId || '',
        upsId: newServer.upsId || '',
        ilo_name: newServer.ilo_name || '',
        ilo_ip: newServer.ilo_ip || '',
        ilo_login: newServer.ilo_login || '',
        ilo_password: newServer.ilo_password || '',
      });
      serverIpStatus.value = newServer.id ? 'success' : 'idle';
      iloIpStatus.value = newServer.ilo_ip ? 'success' : 'idle';
    } else {
      Object.assign(form, {
        name: '',
        state: 'active',
        grace_period_on: 30,
        grace_period_off: 30,
        adminUrl: '',
        ip: '',
        login: '',
        password: '',
        type: 'physical',
        priority: 1,
        roomId: props.rooms[0]?.id || '',
        upsId: '',
        ilo_name: '',
        ilo_ip: '',
        ilo_login: '',
        ilo_password: '',
      });
      serverIpStatus.value = 'idle';
      iloIpStatus.value = 'idle';
    }
  },
  { immediate: true },
);

watch(
  () => form.roomId,
  () => {
    if (
      form.upsId &&
      !filteredUpsList.value.find((ups) => ups.id === form.upsId)
    ) {
      form.upsId = '';
    }
  },
);

const handleSubmit = () => {
  const serverData: ServerCreationDto & { status?: string } = {
    name: form.name,
    state: form.state,
    grace_period_on: form.grace_period_on,
    grace_period_off: form.grace_period_off,
    adminUrl: form.adminUrl,
    ip: form.ip,
    login: form.login,
    password: form.password,
    type: form.type,
    priority: form.priority,
    roomId: form.roomId,
    upsId: form.upsId || undefined,
    status: serverIpStatus.value === 'success' ? 'connected' : 'pending',
  };

  if (form.type === 'physical' && form.ilo_ip) {
    Object.assign(serverData, {
      ilo_name: form.ilo_name,
      ilo_ip: form.ilo_ip,
      ilo_login: form.ilo_login,
      ilo_password: form.ilo_password,
    });
  }

  emit('save', serverData);
};
</script>
