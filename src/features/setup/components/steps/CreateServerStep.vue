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
            </label>
            <select
              id="type"
              v-model="form.type"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
              :disabled="props.isReadOnly"
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
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Power :size="18" class="text-primary" />
              {{ t('setup_server.state_label') }}
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
                :disabled="!ipv4Regex.test(form.ip)"
              />
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

      <div>
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
              for="grace_period_on"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Timer :size="18" class="text-primary" />
              {{ t('setup_server.grace_period_on_label') }}
            </label>
            <input
              id="grace_period_on"
              v-model.number="form.grace_period_on"
              type="number"
              min="10"
              max="300"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
              :disabled="props.isReadOnly"
            />
            <span
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
              >{{ t('setup_server.grace_period_on_hint') }}</span
            >
          </div>
          <div>
            <label
              for="grace_period_off"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <TimerOff :size="18" class="text-primary" />
              {{ t('setup_server.grace_period_off_label') }}
            </label>
            <input
              id="grace_period_off"
              v-model.number="form.grace_period_off"
              type="number"
              min="10"
              max="300"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
              :disabled="props.isReadOnly"
            />
            <span
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
              >{{ t('setup_server.grace_period_off_hint') }}</span
            >
          </div>
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
        :disabled="isSubmitting || setupStore.isLoading"
        class="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95 disabled:opacity-60"
      >
        <Server :size="20" />
        {{
          isSubmitting ? t('setup_server.submitting') : t('setup_server.submit')
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
  Timer,
  TimerOff,
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
import { createServer, pingServer, pingIlo } from '@/features/servers/api';
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
  grace_period_on: number;
  grace_period_off: number;
  priority: number;
  roomId: string;
  upsId: string;
}

const form = reactive<ServerForm>({
  name: '',
  state: 'UP',
  type: 'physical',
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
  grace_period_on: 60,
  grace_period_off: 30,
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
        grace_period_on: serverData.grace_period_on || form.grace_period_on,
        grace_period_off: serverData.grace_period_off || form.grace_period_off,
        priority: serverData.priority || form.priority,
        roomId: serverData.roomId || form.roomId,
        upsId: serverData.upsId || form.upsId,
      });
    }
  }

  loadAvailableResources();
});

const testServerPing = async (ip: string) => {
  const payload = {
    name: form.name.trim() || 'temp-server',
    ip: ip.trim(),
    state: form.state,
    adminUrl: form.adminUrl || 'http://localhost',
    login: 'temp',
    password: 'temp',
    type: form.type,
    priority: form.priority,
    grace_period_on: form.grace_period_on,
    grace_period_off: form.grace_period_off,
    roomId: form.roomId,
    upsId: form.upsId,
    ilo: {
      name: 'temp-ilo',
      ip: '127.0.0.1',
      login: 'temp',
      password: 'temp',
    },
  };

  const tempServer = await createServer(payload);
  try {
    return await pingServer(tempServer.id);
  } finally {
    // TODO: Delete temp server after ping test
  }
};

const testIloPing = async (ip: string) => {
  const payload = {
    name: form.name.trim() || 'temp-server',
    ip: form.ip || '127.0.0.1',
    state: form.state,
    adminUrl: form.adminUrl || 'http://localhost',
    login: 'temp',
    password: 'temp',
    type: form.type,
    priority: form.priority,
    grace_period_on: form.grace_period_on,
    grace_period_off: form.grace_period_off,
    roomId: form.roomId,
    upsId: form.upsId,
    ilo: {
      name: 'temp-ilo',
      ip: ip.trim(),
      login: 'temp',
      password: 'temp',
    },
  };

  const tempServer = await createServer(payload);
  try {
    return await pingIlo(tempServer.id);
  } finally {
    // TODO: Delete temp server after ping test
  }
};

const handleSubmit = async () => {
  if (!form.name.trim()) return toast.error(t('setup_server.name_required'));
  if (!ipv4Regex.test(form.ip))
    return toast.error(t('setup_server.ip_invalid'));
  if (!form.adminUrl) return toast.error(t('setup_server.admin_url_required'));
  if (!form.osLogin.trim() || !form.osPassword)
    return toast.error(t('setup_server.os_creds_required'));
  if (!form.ilo.name.trim())
    return toast.error(t('setup_server.ilo_name_required'));
  if (!ipv4Regex.test(form.ilo.ip))
    return toast.error(t('setup_server.ilo_ip_invalid'));
  if (!form.ilo.login.trim() || !form.ilo.password)
    return toast.error(t('setup_server.ilo_creds_required'));
  if (!form.roomId) return toast.error(t('setup_server.select_room_error'));
  if (!form.upsId) return toast.error(t('setup_server.select_ups_error'));

  if (form.osLogin.trim() === form.ilo.login.trim()) {
    toast.warning(t('setup_server.same_login_warning'));
  }
  if (form.osPassword && form.osPassword === form.ilo.password) {
    toast.warning(t('setup_server.same_password_warning'));
  }

  const payload = {
    name: form.name.trim(),
    ip: form.ip.trim(),
    state: form.state as ServerState,
    adminUrl: form.adminUrl.trim(),
    login: form.osLogin.trim(),
    password: form.osPassword,
    type: form.type as ServerType,
    priority: form.priority,
    grace_period_on: form.grace_period_on,
    grace_period_off: form.grace_period_off,
    roomId: form.roomId,
    upsId: form.upsId,
    ilo: {
      name: form.ilo.name.trim(),
      ip: form.ilo.ip.trim(),
      login: form.ilo.login.trim(),
      password: form.ilo.password,
    },
  };

  try {
    isSubmitting.value = true;
    setupStore.isLoading = true;

    const serverCreated = await createServer(payload);
    await setupStore.completeSetupStep(SetupStep.CREATE_SERVER, {
      ...form,
      id: serverCreated.id,
    });
    toast.success(t('toast.server_created'));
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
