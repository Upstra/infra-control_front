<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { reactive, watch, computed, ref } from 'vue';
import type { Server } from '../types';
import { ipv4Pattern, ipv4Regex, urlRegex } from '@/utils/regex';
import PriorityInput from '@/features/groups/components/PriorityInput.vue';
import ConnectivityTest from '@/shared/components/ConnectivityTest.vue';
import { pingServer, pingIlo } from '@/features/servers/api';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

interface Props {
  show: boolean;
  server: Server | null;
  error?: string | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: Partial<Server>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const internalError = ref<string | null>(null);

const form = reactive({
  name: '',
  ip: '',
  type: 'vcenter' as 'vcenter' | 'esxi',
  priority: 1,
  adminUrl: '',
  login: '',
  grace_period_on: 30,
  grace_period_off: 60,
  ilo: {
    name: '',
    ip: '',
    login: '',
    password: '',
  },
});

watch(
  () => props.server,
  (newServer) => {
    if (newServer) {
      form.name = newServer.name || '';
      form.ip = newServer.ip || '';
      form.type = newServer.type || 'vcenter';
      form.priority = newServer.priority || 1;
      form.adminUrl = newServer.adminUrl || '';
      form.login = newServer.login || '';
      form.grace_period_on = newServer.grace_period_on || 30;
      form.grace_period_off = newServer.grace_period_off || 60;
      if (newServer.ilo) {
        form.ilo.name = newServer.ilo.name || '';
        form.ilo.ip = newServer.ilo.ip || '';
        form.ilo.login = newServer.ilo.login || '';
        form.ilo.password = newServer.ilo.password || '';
      }
    }
    internalError.value = null;
  },
  { immediate: true },
);

watch(
  () => props.error,
  (newError) => {
    internalError.value = newError;
  }
);

const isIpValid = computed(() => {
  return !form.ip || ipv4Regex.test(form.ip);
});

const isAdminUrlValid = computed(() => {
  return !form.adminUrl || urlRegex.test(form.adminUrl);
});

const isIloIpValid = computed(() => {
  return !form.ilo.ip || ipv4Regex.test(form.ilo.ip);
});

const isFormValid = computed(() => {
  const baseValid =
    form.name &&
    form.ip &&
    form.login &&
    isIpValid.value &&
    isAdminUrlValid.value;

  if (form.type === 'esxi') {
    return baseValid && isIloIpValid.value;
  }

  return baseValid;
});

const handleSave = () => {
  if (props.server && isFormValid.value) {
    internalError.value = null;
    const updatedData = {
      name: form.name,
      ip: form.ip,
      type: form.type,
      priority: form.priority,
      adminUrl: form.adminUrl,
      login: form.login,
      grace_period_on: form.grace_period_on,
      grace_period_off: form.grace_period_off,
      ilo: form.ilo.name || form.ilo.ip || form.ilo.login ? form.ilo : null,
    };

    emit('save', updatedData);
  }
};
</script>

<template>
  <div
    v-if="show && server"
    class="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div
        class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
      >
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">
          {{ t('servers.edit_title') }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="p-6 space-y-6">
        <div v-if="internalError" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-start">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ t('common.error') }}
              </h3>
              <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                {{ internalError }}
              </p>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.name') }}</label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.ip') }}</label
            >
            <input
              v-model="form.ip"
              type="text"
              :pattern="ipv4Pattern"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500',
                !isIpValid && form.ip
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500',
                'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white',
              ]"
              required
            />
            <p
              v-if="!isIpValid && form.ip"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ t('validation.invalid_ip') }}
            </p>
            <ConnectivityTest
              v-if="server && form.ip && ipv4Regex.test(form.ip)"
              :ip="form.ip"
              :ping-function="() => pingServer(server!.id)"
              :disabled="!server || !form.ip || !ipv4Regex.test(form.ip)"
              class="mt-2"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.type') }}</label
            >
            <select
              v-model="form.type"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="vcenter">{{ t('servers.vcenter') }}</option>
              <option value="esxi">{{ t('servers.esxi') }}</option>
            </select>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.priority') }}</label
            >
            <PriorityInput
              v-model="form.priority"
              input-id="edit-priority"
              input-class="border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white"
              :required="true"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.admin_url') }}</label
            >
            <input
              v-model="form.adminUrl"
              type="url"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500',
                !isAdminUrlValid && form.adminUrl
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500',
                'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white',
              ]"
            />
            <p
              v-if="!isAdminUrlValid && form.adminUrl"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ t('validation.invalid_url') }}
            </p>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.login') }}</label
            >
            <input
              v-model="form.login"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.grace_on_label') }}</label
            >
            <input
              v-model.number="form.grace_period_on"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >{{ t('servers.grace_off_label') }}</label
            >
            <input
              v-model.number="form.grace_period_off"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div v-if="form.type === 'esxi'" class="space-y-4">
          <h3
            class="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2"
          >
            {{ t('servers.ilo_section') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >{{ t('servers.ilo_name') }}</label
              >
              <input
                v-model="form.ilo.name"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >{{ t('servers.ilo_ip') }}</label
              >
              <input
                v-model="form.ilo.ip"
                type="text"
                :pattern="ipv4Pattern"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500',
                  !isIloIpValid && form.ilo.ip
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500',
                  'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white',
                ]"
              />
              <p
                v-if="!isIloIpValid && form.ilo.ip"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ t('validation.invalid_ip') }}
              </p>
              <ConnectivityTest
                v-if="server && form.ilo.ip && ipv4Regex.test(form.ilo.ip)"
                :ip="form.ilo.ip"
                :ping-function="() => pingIlo(server!.id)"
                :disabled="
                  !server || !form.ilo.ip || !ipv4Regex.test(form.ilo.ip)
                "
                class="mt-2"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >{{ t('servers.ilo_login') }}</label
              >
              <input
                v-model="form.ilo.login"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div
          class="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700"
        >
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-600"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            :class="[
              'px-4 py-2 text-white rounded-lg transition-colors',
              isFormValid
                ? 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed',
            ]"
          >
            {{ t('servers.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
