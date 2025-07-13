<template>
  <Modal :open="open" @close="$emit('update:open', false)" :size="'xl'">
    <div
      class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6"
      :class="{ 'ring-2 ring-red-500': hasValidationErrors }"
    >
      <div
        v-if="missingFields.length > 0"
        class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <h4 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
          Données manquantes requises :
        </h4>
        <p class="text-sm text-red-700 dark:text-red-300">
          {{ missingFields.join(', ') }}
        </p>
      </div>
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
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white',
                  hasFieldError('salle')
                    ? 'border-red-300 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600',
                ]"
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
              <div class="relative">
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  :class="[
                    'mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white pr-10',
                    hasFieldError('nom') ||
                    (!nameValidation.isValid && !nameValidation.isLoading)
                      ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  ]"
                  :placeholder="t('setup_server.name_placeholder')"
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

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label
                  for="type"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.type_label') }}
                  <span class="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  v-model="form.type"
                  required
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="vcenter">
                    {{ t('setup_server.type_vcenter') }}
                  </option>
                  <option value="esxi">
                    {{ t('setup_server.type_esxi') }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="state"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.state_label') }}
                  <span class="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  v-model="form.state"
                  required
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
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="priority"
                  v-model.number="form.priority"
                  type="number"
                  min="1"
                  max="10"
                  required
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
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="grace_on"
                  v-model.number="form.grace_period_on"
                  type="number"
                  min="0"
                  required
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
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="grace_off"
                  v-model.number="form.grace_period_off"
                  type="number"
                  min="0"
                  required
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
              <div class="relative">
                <input
                  id="ip"
                  v-model="form.ip"
                  type="text"
                  :placeholder="t('setup_server.ip_placeholder')"
                  :class="[
                    'mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white sm:text-sm pr-10',
                    ipValidation.isValid && !ipValidation.isLoading
                      ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                      : !ipValidation.isValid
                        ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  ]"
                  required
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
              <p
                v-if="ipValidation.error"
                class="mt-1 text-xs text-red-600 dark:text-red-400"
              >
                {{ ipValidation.error }}
              </p>
              <ConnectivityTest
                v-else-if="form.ip && ipv4Regex.test(form.ip)"
                :ip="form.ip"
                :ping-function="() => pingServerByIp(form.ip)"
                :disabled="!form.ip || !ipv4Regex.test(form.ip)"
                class="mt-2"
              />
            </div>

            <div>
              <label
                for="adminUrl"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('setup_server.admin_url_label') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                id="adminUrl"
                v-model="form.adminUrl"
                type="url"
                required
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
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="login"
                  v-model="form.login"
                  type="text"
                  autocomplete="off"
                  required
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
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  :placeholder="t('setup_server.os_password_placeholder')"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="form.type === 'vcenter' || form.type === 'esxi'">
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
                <span class="text-red-500">*</span>
              </label>
              <input
                id="ilo_name"
                v-model="form.ilo_name"
                type="text"
                required
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white',
                  hasFieldError('nom ILO')
                    ? 'border-red-300 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600',
                ]"
                :placeholder="t('setup_server.ilo_name_placeholder')"
              />
            </div>

            <div>
              <label
                for="ilo_ip"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ t('setup_server.ilo_ip_label') }}
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="ilo_ip"
                  v-model="form.ilo_ip"
                  type="text"
                  required
                  :placeholder="t('setup_server.ilo_ip_placeholder')"
                  :class="[
                    'mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white sm:text-sm pr-10',
                    hasFieldError('IP ILO') ||
                    (!iloIpValidation.isValid && !iloIpValidation.isLoading)
                      ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  ]"
                  @input="handleIloIpValidation"
                  @blur="handleIloIpValidation"
                />
                <div
                  class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                >
                  <Loader
                    v-if="iloIpValidation.isLoading"
                    :size="16"
                    class="animate-spin text-gray-400"
                  />
                  <CheckCircle
                    v-else-if="iloIpValidation.isValid && form.ilo_ip.trim()"
                    :size="16"
                    class="text-green-500"
                  />
                  <AlertCircle
                    v-else-if="!iloIpValidation.isValid"
                    :size="16"
                    class="text-red-500"
                  />
                </div>
              </div>
              <p
                v-if="iloIpValidation.error"
                class="mt-1 text-xs text-red-600 dark:text-red-400"
              >
                {{ iloIpValidation.error }}
              </p>
              <ConnectivityTest
                v-else-if="form.ilo_ip && ipv4Regex.test(form.ilo_ip)"
                :ip="form.ilo_ip"
                :ping-function="() => pingIloByIp(form.ilo_ip)"
                :disabled="!form.ilo_ip || !ipv4Regex.test(form.ilo_ip)"
                class="mt-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="ilo_login"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.ilo_login_label') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="ilo_login"
                  v-model="form.ilo_login"
                  type="text"
                  autocomplete="off"
                  required
                  :class="[
                    'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white',
                    hasFieldError('login ILO')
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600',
                  ]"
                  :placeholder="t('setup_server.ilo_login_placeholder')"
                />
              </div>

              <div>
                <label
                  for="ilo_password"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('setup_server.ilo_password_label') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="ilo_password"
                  v-model="form.ilo_password"
                  type="password"
                  autocomplete="new-password"
                  required
                  :class="[
                    'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white',
                    hasFieldError('mot de passe ILO')
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600',
                  ]"
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
import { CheckCircle, AlertCircle, Loader } from 'lucide-vue-next';
import Modal from '@/shared/components/Modal.vue';
import ConnectivityTest from '@/shared/components/ConnectivityTest.vue';
import { pingServerByIp, pingIloByIp } from '@/features/servers/api';
import { ipv4Regex } from '@/utils/regex';
import { useRealTimeValidation } from '../../composables/useRealTimeValidation';
import type { ServerCreationDto } from '../../types';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  server?: any;
  rooms: any[];
  upsList: any[];
  serversList?: any[];
  hasValidationErrors?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [server: ServerCreationDto & { status?: string }];
}>();

const { t } = useI18n();

const getAllResources = () => [
  ...(props.upsList || []),
  ...(props.serversList || []),
];

const { validateIp: validateIpRealTime, validateName: validateNameRealTime } =
  useRealTimeValidation(getAllResources, props.server?.id);

const form = reactive({
  name: '',
  state: 'active',
  grace_period_on: 30,
  grace_period_off: 30,
  adminUrl: '',
  ip: '',
  login: '',
  password: '',
  type: 'vcenter',
  priority: 1,
  roomId: '',
  upsId: '',
  ilo_name: '',
  ilo_ip: '',
  ilo_login: '',
  ilo_password: '',
});

const nameValidation = ref({ isValid: true, isLoading: false, error: '' });
const ipValidation = ref({ isValid: true, isLoading: false, error: '' });
const iloIpValidation = ref({ isValid: true, isLoading: false, error: '' });

const filteredUpsList = computed(() => {
  if (!form.roomId) return [];
  return props.upsList.filter((ups) => ups.roomId === form.roomId);
});

const canSave = computed(() => {
  const baseValidation =
    form.name &&
    form.roomId &&
    form.ip &&
    ipv4Regex.test(form.ip) &&
    form.login &&
    form.password &&
    form.adminUrl &&
    form.grace_period_on !== null &&
    form.grace_period_off !== null &&
    nameValidation.value.isValid &&
    ipValidation.value.isValid &&
    iloIpValidation.value.isValid;

  // For VMware servers, ILO name, IP, login and password are required
  if (form.type === 'vcenter' || form.type === 'esxi') {
    return (
      baseValidation &&
      form.ilo_name &&
      form.ilo_ip &&
      ipv4Regex.test(form.ilo_ip) &&
      form.ilo_login &&
      form.ilo_password
    );
  }

  return baseValidation;
});

const missingFields = computed(() => {
  const missing: string[] = [];

  if (!form.name) missing.push('nom');
  if (!form.roomId) missing.push('salle');
  if (!form.ip) missing.push('IP');
  if (!form.login) missing.push('login');
  if (!form.password) missing.push('mot de passe');
  if (!form.adminUrl) missing.push('URL admin');
  if (form.grace_period_on === null || form.grace_period_on === undefined)
    missing.push('délai démarrage');
  if (form.grace_period_off === null || form.grace_period_off === undefined)
    missing.push('délai arrêt');

  if (form.type === 'vcenter' || form.type === 'esxi') {
    if (!form.ilo_name) missing.push('nom ILO');
    if (!form.ilo_ip) missing.push('IP ILO');
    if (!form.ilo_login) missing.push('login ILO');
    if (!form.ilo_password) missing.push('mot de passe ILO');
  }

  return missing;
});

const hasFieldError = (fieldName: string) => {
  return missingFields.value.includes(fieldName);
};

const handleNameValidation = async () => {
  if (!form.name.trim()) {
    nameValidation.value = { isValid: true, isLoading: false, error: '' };
    return;
  }

  nameValidation.value.isLoading = true;
  const result = await validateNameRealTime(form.name, 'server');
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

const handleIloIpValidation = async () => {
  if (!form.ilo_ip.trim()) {
    iloIpValidation.value = { isValid: true, isLoading: false, error: '' };
    return;
  }

  iloIpValidation.value.isLoading = true;
  const result = await validateIpRealTime(form.ilo_ip);
  iloIpValidation.value = {
    isValid: result.isValid,
    isLoading: result.isLoading,
    error: result.error || '',
  };
};

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
        type: newServer.type || 'vcenter',
        priority: newServer.priority || 1,
        roomId: newServer.roomId || '',
        upsId: newServer.upsId || '',
        ilo_name: newServer.ilo_name || '',
        ilo_ip: newServer.ilo_ip || '',
        ilo_login: newServer.ilo_login || '',
        ilo_password: newServer.ilo_password || '',
      });
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
        type: 'vcenter',
        priority: 1,
        roomId: props.rooms[0]?.id || '',
        upsId: '',
        ilo_name: '',
        ilo_ip: '',
        ilo_login: '',
        ilo_password: '',
      });
    }
    nameValidation.value = { isValid: true, isLoading: false, error: '' };
    ipValidation.value = { isValid: true, isLoading: false, error: '' };
    iloIpValidation.value = { isValid: true, isLoading: false, error: '' };
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
    status: 'pending' as const,
  };

  if ((form.type === 'vcenter' || form.type === 'esxi') && form.ilo_ip) {
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
