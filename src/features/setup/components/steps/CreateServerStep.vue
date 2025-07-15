<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup_server.title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto"
      >
        {{ t('setup_server.description') }}
      </p>
    </div>

    <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4 text-center">
      <span class="text-red-500">*</span> {{ t('setup.required_fields') }}
    </p>

    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-8"
      autocomplete="off"
    >
      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('setup_server.location_title') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="roomId"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Building2 :size="18" class="text-primary" />
              {{ t('setup_server.room_label') }}
              <span class="text-red-500">*</span>
            </label>
            <select
              id="roomId"
              v-model="form.roomId"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :class="{ 'bg-gray-100 dark:bg-gray-800': !canSelectRoom }"
              :disabled="!canSelectRoom || props.isReadOnly"
              required
            >
              <option v-if="!availableRooms.length" disabled value="">
                {{ t('setup_server.no_room') }}
              </option>
              <option
                v-for="room in availableRooms"
                :key="room.id"
                :value="room.id"
              >
                {{ room.name }}
              </option>
            </select>

            <span
              v-if="isUsingSetupRoom"
              class="text-xs text-primary mt-1 block"
            >
              <CheckCircle :size="14" class="inline mr-1" />
              {{ t('setup_server.room_created') }}
            </span>
            <span
              v-else-if="availableRooms.length > 1"
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
            >
              {{ t('setup_server.select_room_hint') }}
            </span>
          </div>

          <div>
            <label
              for="upsId"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <BatteryCharging :size="18" class="text-primary" />
              {{ t('setup_server.ups_label') }}
              <span class="text-red-500">*</span>
            </label>
            <select
              id="upsId"
              v-model="form.upsId"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :class="{ 'bg-gray-100 dark:bg-gray-800': !canSelectUps }"
              :disabled="!canSelectUps || props.isReadOnly"
              required
            >
              <option v-if="!availableUps.length" disabled value="">
                {{ t('setup_server.no_ups') }}
              </option>
              <option v-for="ups in availableUps" :key="ups.id" :value="ups.id">
                {{ ups.name }}
              </option>
            </select>

            <span
              v-if="isUsingSetupUps"
              class="text-xs text-primary mt-1 block"
            >
              <CheckCircle :size="14" class="inline mr-1" />
              {{ t('setup_server.ups_created') }}
            </span>
            <span
              v-else-if="availableUps.length > 1"
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
            >
              {{ t('setup_server.select_ups_hint') }}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('setup_server.general_title') }}
        </h3>
        <div class="mb-6">
          <label
            for="name"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Server :size="18" class="text-primary" />
            {{ t('setup_server.name_label') }}
            <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('setup_server.name_placeholder')"
            required
            maxlength="64"
            :disabled="props.isReadOnly"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="type"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Cpu :size="18" class="text-primary" />
              {{ t('setup_server.type_label') }}
              <span class="text-red-500">*</span>
            </label>
            <select
              id="type"
              v-model="form.type"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
              :disabled="props.isReadOnly"
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
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Power :size="18" class="text-primary" />
              {{ t('setup_server.state_label') }}
              <span class="text-red-500">*</span>
            </label>
            <select
              id="state"
              v-model="form.state"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
              :disabled="props.isReadOnly"
            >
              <option value="UP">{{ t('setup_server.state_on') }}</option>
              <option value="DOWN">
                {{ t('setup_server.state_off') }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('setup_server.network_title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="ip"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Network :size="18" class="text-primary" />
              {{ t('setup_server.ip_label') }}
              <span class="text-red-500">*</span>
            </label>
            <div class="space-y-2">
              <input
                id="ip"
                v-model="form.ip"
                type="text"
                class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                :placeholder="t('setup_server.ip_placeholder')"
                :pattern="ipv4Pattern"
                required
                :disabled="props.isReadOnly"
              />
              <ConnectivityTest
                v-if="form.ip && !props.isReadOnly"
                :ip="form.ip"
                :ping-function="testServerPing"
                :disabled="!canPingServer"
              />
              <span
                v-if="savedServerId && form.ip && ipv4Regex.test(form.ip)"
                class="text-xs text-blue-600 dark:text-blue-400 block"
              >
                💾 {{ t('connectivity.saved_for_validation') }}
              </span>
              <span
                class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
                >{{ t('setup_server.ip_hint') }}</span
              >
            </div>
          </div>
          <div>
            <label
              for="adminUrl"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Globe :size="18" class="text-primary" />
              {{ t('setup_server.admin_url_label') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              id="adminUrl"
              v-model="form.adminUrl"
              type="url"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_server.admin_url_placeholder')"
              required
              :disabled="props.isReadOnly"
            />
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('setup_server.os_section_title') }}
        </h3>
        <p class="text-xs text-neutral dark:text-neutral-400 mb-3">
          {{ t('setup_server.os_section_hint') }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="os-login"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <User :size="18" class="text-primary" />
              {{ t('setup_server.os_login_label') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              id="os-login"
              v-model="form.osLogin"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_server.os_login_placeholder')"
              required
              :disabled="props.isReadOnly"
            />
          </div>
          <div>
            <label
              for="os-password"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Lock :size="18" class="text-primary" />
              {{ t('setup_server.os_password_label') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              id="os-password"
              v-model="form.osPassword"
              type="password"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_server.os_password_placeholder')"
              required
              :disabled="props.isReadOnly"
            />
          </div>
        </div>
      </div>

      <div v-if="form.type === 'esxi'">
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('setup_server.ilo_section_title') }}
        </h3>
        <p class="text-xs text-neutral dark:text-neutral-400 mb-3">
          {{ t('setup_server.ilo_section_hint') }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="ilo-name"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Server :size="18" class="text-primary" />
              {{ t('setup_server.ilo_name_label') }}
            </label>
            <input
              id="ilo-name"
              v-model="form.ilo.name"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_server.ilo_name_placeholder')"
              required
              :disabled="props.isReadOnly"
            />
            <span
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
              >{{ t('setup_server.ilo_name_hint') }}</span
            >
          </div>
          <div>
            <label
              for="ilo-ip"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Network :size="18" class="text-primary" />
              {{ t('setup_server.ilo_ip_label') }}
            </label>
            <div class="space-y-2">
              <input
                id="ilo-ip"
                v-model="form.ilo.ip"
                type="text"
                class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                :placeholder="t('setup_server.ilo_ip_placeholder')"
                :pattern="ipv4Pattern"
                required
                :disabled="props.isReadOnly"
              />
              <ConnectivityTest
                v-if="form.ilo.ip && !props.isReadOnly"
                :ip="form.ilo.ip"
                :ping-function="testIloPing"
                :disabled="!ipv4Regex.test(form.ilo.ip)"
              />
              <span
                v-if="
                  savedServerId && form.ilo.ip && ipv4Regex.test(form.ilo.ip)
                "
                class="text-xs text-blue-600 dark:text-blue-400 block"
              >
                💾 {{ t('connectivity.ilo_saved_for_validation') }}
              </span>
              <span
                class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
                >{{ t('setup_server.ilo_ip_hint') }}</span
              >
            </div>
          </div>
          <div>
            <label
              for="ilo-login"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <User :size="18" class="text-primary" />
              {{ t('setup_server.ilo_login_label') }}
            </label>
            <input
              id="ilo-login"
              v-model="form.ilo.login"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_server.ilo_login_placeholder')"
              required
              :disabled="props.isReadOnly"
            />
          </div>
          <div>
            <label
              for="ilo-password"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Lock :size="18" class="text-primary" />
              {{ t('setup_server.ilo_password_label') }}
            </label>
            <input
              id="ilo-password"
              v-model="form.ilo.password"
              type="password"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_server.ilo_password_placeholder')"
              required
              :disabled="props.isReadOnly"
            />
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('setup_server.advanced_title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="priority"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <ArrowUpDown :size="18" class="text-primary" />
              {{ t('setup_server.priority_label') }}
            </label>
            <input
              id="priority"
              v-model.number="form.priority"
              type="number"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              min="1"
              max="999"
              required
              :disabled="props.isReadOnly"
            />
            <span
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
              >{{ t('setup_server.priority_hint') }}</span
            >
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg px-4 py-3 mt-2 text-primary-dark dark:text-primary text-sm"
      >
        <Info :size="18" class="flex-shrink-0" />
        <span>
          {{ t('setup_server.info_reference') }}
        </span>
      </div>

      <button
        v-if="!props.isReadOnly"
        type="submit"
        :disabled="isSubmitting || setupStore.isLoading || !isFormValid"
        class="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95 disabled:opacity-60"
      >
        <Server :size="20" />
        {{
          isSubmitting
            ? t('setup_server.submitting')
            : !isFormValid
              ? t('setup_server.complete_form')
              : t('setup_server.submit')
        }}
      </button>
      <div
        v-else
        class="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
      >
        <Info :size="16" class="inline mr-2" />
        {{ t('setup.read_only_message') }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, withDefaults } from 'vue';
import {
  Server,
  Cpu,
  Power,
  Network,
  Globe,
  User,
  Lock,
  ArrowUpDown,
  BatteryCharging,
  Info,
  Building2,
  CheckCircle,
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { SetupStep } from '../../types';
import {
  createServer,
  pingServer,
  pingIlo,
  updateServer,
} from '@/features/servers/api';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import type { RoomResponseDto } from '@/features/rooms/types';
import type { ServerState, ServerType } from '@/features/servers/types';
import { ipv4Pattern, ipv4Regex } from '@/utils/regex';
import ConnectivityTest from '@/shared/components/ConnectivityTest.vue';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

interface Props {
  isReadOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReadOnly: false,
});

const availableRooms = ref<RoomResponseDto[]>([]);
const availableUps = ref<any[]>([]);
const isLoadingRooms = ref(false);
const isLoadingUps = ref(false);

const roomData = setupStore.getStepData(SetupStep.CREATE_ROOM);
const upsData = setupStore.getStepData(SetupStep.CREATE_UPS);

const isUsingSetupRoom = computed(
  () => roomData.id && form.roomId === roomData.id,
);

const isUsingSetupUps = computed(() => upsData.id && form.upsId === upsData.id);

const canSelectRoom = computed(
  () => availableRooms.value.length > 0 && !isLoadingRooms.value,
);

const canSelectUps = computed(
  () => availableUps.value.length > 0 && !isLoadingUps.value,
);

const canPingServer = computed(() => {
  return (
    form.name.trim() &&
    form.ip.trim() &&
    ipv4Regex.test(form.ip) &&
    form.roomId &&
    form.upsId &&
    form.type &&
    form.state &&
    form.adminUrl.trim() &&
    form.osLogin.trim() &&
    form.osPassword
  );
});

const isFormValid = computed(() => {
  return (
    form.name.trim() &&
    form.ip.trim() &&
    ipv4Regex.test(form.ip) &&
    form.roomId &&
    form.upsId &&
    form.osLogin.trim() &&
    form.osPassword &&
    form.ilo.name.trim() &&
    form.ilo.ip.trim() &&
    ipv4Regex.test(form.ilo.ip) &&
    form.ilo.login.trim() &&
    form.ilo.password
  );
});

interface ServerForm {
  name: string;
  state: ServerState;
  type: ServerType;
  ip: string;
  adminUrl: string;
  osLogin: string;
  osPassword: string;
  ilo: {
    name: string;
    ip: string;
    login: string;
    password: string;
  };
  priority: number;
  roomId: string;
  upsId: string;
}

const form = reactive<ServerForm>({
  name: '',
  state: 'UP',
  type: 'vcenter',
  ip: '',
  adminUrl: '',
  osLogin: '',
  osPassword: '',
  ilo: {
    name: '',
    ip: '',
    login: '',
    password: '',
  },
  priority: 1,
  roomId: roomData.id || '',
  upsId: upsData.id || '',
});

const isSubmitting = ref(false);

const loadAvailableResources = async () => {
  try {
    isLoadingRooms.value = true;
    const response = await roomApi.fetchRooms();
    availableRooms.value = response.items || [];

    if (
      roomData.id &&
      !availableRooms.value.find((r) => r.id === roomData.id)
    ) {
      availableRooms.value.unshift({
        id: roomData.id,
        name: roomData.name || t('setup_server.default_room_setup'),
      });
    }
  } catch (error) {
    if (roomData.id) {
      availableRooms.value = [
        {
          id: roomData.id,
          name: roomData.name || t('setup_server.default_room_main'),
        },
      ];
    }
  } finally {
    isLoadingRooms.value = false;
  }

  try {
    isLoadingUps.value = true;
    const upsList = await upsApi.getAllAdmin();
    availableUps.value = upsList || [];

    if (upsData.id && !availableUps.value.find((u) => u.id === upsData.id)) {
      availableUps.value.unshift({
        id: upsData.id,
        name: upsData.name || t('setup_server.default_ups_setup'),
      });
    }
  } catch (error) {
    if (upsData.id) {
      availableUps.value = [
        {
          id: upsData.id,
          name: upsData.name || t('setup_server.default_ups_main'),
        },
      ];
    }
  } finally {
    isLoadingUps.value = false;
  }
};

onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }

  if (props.isReadOnly) {
    const serverData = setupStore.getStepData(SetupStep.CREATE_SERVER);
    if (serverData) {
      Object.assign(form, {
        name: serverData.name || form.name,
        state: serverData.state || form.state,
        type: serverData.type || form.type,
        ip: serverData.ip || form.ip,
        adminUrl: serverData.adminUrl || form.adminUrl,
        osLogin: serverData.osLogin || form.osLogin,
        osPassword: serverData.osPassword || form.osPassword,
        ilo: serverData.ilo || form.ilo,
        priority: serverData.priority || form.priority,
        roomId: serverData.roomId || form.roomId,
        upsId: serverData.upsId || form.upsId,
      });
    }
  }

  loadAvailableResources();
});

let savedServerId: string | null = null;
let savedIloId: string | null = null;

const testServerPing = async (ip: string) => {
  if (!savedServerId) {
    const payload = {
      name: form.name.trim(),
      ip: ip.trim(),
      state: form.state as ServerState,
      adminUrl: form.adminUrl.trim(),
      login: form.osLogin.trim(),
      password: form.osPassword,
      type: form.type as ServerType,
      priority: form.priority,
      roomId: form.roomId,
      upsId: form.upsId,
      ilo: {
        name: form.ilo.name.trim() || 'temp-ilo',
        ip: form.ilo.ip.trim() || '127.0.0.1',
        login: form.ilo.login.trim() || 'temp',
        password: form.ilo.password || 'temp',
      },
    };
    const savedServer = await createServer(payload);
    savedServerId = savedServer.id;
    savedIloId = savedServer.ilo?.id || null;

    if (savedServer.ilo) {
      form.ilo.name = savedServer.ilo.name || form.ilo.name;
      form.ilo.ip = savedServer.ilo.ip || form.ilo.ip;
      form.ilo.login = savedServer.ilo.login || form.ilo.login;
    }
  } else {
    const updatedServer = await updateServer(savedServerId, {
      ip: ip.trim(),
      name: form.name.trim(),
      adminUrl: form.adminUrl.trim(),
      login: form.osLogin.trim(),
      password: form.osPassword,
    });
    savedIloId = updatedServer.ilo?.id || savedIloId;
  }

  return await pingServer(savedServerId);
};

const testIloPing = async (ip: string) => {
  if (!savedServerId) {
    await testServerPing(form.ip);
  }

  const updatedServer = await updateServer(savedServerId!, {
    ilo: {
      name: form.ilo.name.trim() || 'temp-ilo',
      ip: ip.trim(),
      login: form.ilo.login.trim() || 'temp',
      password: form.ilo.password || 'temp',
    },
  });
  savedIloId = updatedServer.ilo?.id || savedIloId;

  if (updatedServer.ilo) {
    form.ilo.name = updatedServer.ilo.name || form.ilo.name;
    form.ilo.login = updatedServer.ilo.login || form.ilo.login;
  }

  if (!savedIloId) {
    throw new Error('iLO ID not found after server update');
  }

  return await pingIlo(savedServerId!);
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return toast.error(t('setup_server.complete_form_error'));
  }

  if (form.osLogin.trim() === form.ilo.login.trim()) {
    toast.warning(t('setup_server.same_login_warning'));
  }
  if (form.osPassword && form.osPassword === form.ilo.password) {
    toast.warning(t('setup_server.same_password_warning'));
  }

  try {
    isSubmitting.value = true;
    setupStore.isLoading = true;

    let serverId: string;

    if (savedServerId) {
      await updateServer(savedServerId, {
        name: form.name.trim(),
        ip: form.ip.trim(),
        state: form.state as ServerState,
        adminUrl: form.adminUrl.trim(),
        login: form.osLogin.trim(),
        password: form.osPassword,
        type: form.type as ServerType,
        priority: form.priority,
        roomId: form.roomId,
        upsId: form.upsId,
        ilo: {
          name: form.ilo.name.trim(),
          ip: form.ilo.ip.trim(),
          login: form.ilo.login.trim(),
          password: form.ilo.password,
        },
      });
      serverId = savedServerId;
      toast.success(t('toast.server_updated'));
    } else {
      const payload = {
        name: form.name.trim(),
        ip: form.ip.trim(),
        state: form.state as ServerState,
        adminUrl: form.adminUrl.trim(),
        login: form.osLogin.trim(),
        password: form.osPassword,
        type: form.type as ServerType,
        priority: form.priority,
        roomId: form.roomId,
        upsId: form.upsId,
        ilo: {
          name: form.ilo.name.trim(),
          ip: form.ilo.ip.trim(),
          login: form.ilo.login.trim(),
          password: form.ilo.password,
        },
      };
      const serverCreated = await createServer(payload);
      serverId = serverCreated.id;
      toast.success(t('toast.server_created'));
    }

    await setupStore.completeSetupStep(SetupStep.CREATE_SERVER, {
      ...form,
      id: serverId,
    });
  } catch (error: unknown) {
    const err = error as any;
    toast.error(
      err.response?.data?.message || err.message || t('setup_server.error'),
    );
  } finally {
    isSubmitting.value = false;
    setupStore.isLoading = false;
  }
};
</script>
