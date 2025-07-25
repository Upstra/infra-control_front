<template>
  <div class="w-full max-w-2xl">
    <div class="mb-6 text-center">
      <h2
        class="text-2xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('servers.create_title') }}
      </h2>
      <p class="mt-2 text-base text-neutral-dark dark:text-neutral-300">
        {{ t('servers.create_description') }}
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-8"
      autocomplete="off"
    >
      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('servers.location_title') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="roomId"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Building2 :size="18" class="text-primary" />
              {{ t('servers.room_label') }}
            </label>
            <select
              id="roomId"
              v-model="form.roomId"
              class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              :class="{ 'bg-gray-100': !canSelectRoom }"
              :disabled="!canSelectRoom"
              required
            >
              <option v-if="!availableRooms.length" disabled value="">
                {{ t('servers.no_room') }}
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
              v-if="availableRooms.length > 1"
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
            >
              {{ t('servers.select_room_hint') }}
            </span>
          </div>

          <div>
            <label
              for="upsId"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <BatteryCharging :size="18" class="text-primary" />
              {{ t('servers.ups_label') }}
            </label>
            <select
              id="upsId"
              v-model="form.upsId"
              class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              :class="{ 'bg-gray-100': !canSelectUps }"
              :disabled="!canSelectUps"
            >
              <option value="">{{ t('servers.no_ups_optional') }}</option>
              <option v-for="ups in availableUps" :key="ups.id" :value="ups.id">
                {{ ups.name }}
              </option>
            </select>
            <span
              v-if="availableUps.length > 1"
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
            >
              {{ t('servers.select_ups_hint') }}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('servers.general_title') }}
        </h3>

        <div class="mb-6">
          <label
            for="name"
            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1 dark:text-neutral-300"
          >
            <Server :size="18" class="text-primary" />
            {{ t('servers.name') }}
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            :placeholder="t('servers.name_placeholder')"
            required
            maxlength="64"
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('servers.name_hint')
          }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="type"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Cpu :size="18" class="text-primary" />
              {{ t('servers.type') }}
            </label>
            <select
              id="type"
              v-model="form.type"
              class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
            >
              <option value="vcenter">{{ t('servers.vcenter') }}</option>
              <option value="esxi">{{ t('servers.esxi') }}</option>
            </select>
          </div>
          <div>
            <label
              for="priority"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Star :size="18" class="text-primary" />
              {{ t('servers.priority') }}
            </label>
            <PriorityInput
              v-model="form.priority"
              input-id="priority"
              :required="true"
              :hint="t('servers.priority_hint_extended')"
            />
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('servers.network_title') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="ip"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Globe :size="18" class="text-primary" />
              {{ t('servers.ip') }}
            </label>
            <input
              id="ip"
              v-model="form.ip"
              type="text"
              :class="[
                'block w-full border rounded-lg px-3 py-2 text-base focus:ring-2 transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white',
                !isIpValid && form.ip
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary focus:border-primary',
              ]"
              :placeholder="t('servers.ip_placeholder')"
              :pattern="ipv4Pattern"
              required
            />
            <p
              v-if="!isIpValid && form.ip"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ t('validation.invalid_ip') }}
            </p>
            <span v-else class="text-xs text-neutral mt-1 block">{{
              t('servers.ip_hint')
            }}</span>
            <ConnectivityTest
              v-if="form.ip && ipv4Regex.test(form.ip)"
              :ip="form.ip"
              :ping-function="() => pingServerByIp(form.ip)"
              :disabled="!form.ip || !ipv4Regex.test(form.ip)"
              class="mt-2"
            />
          </div>
          <div>
            <label
              for="adminUrl"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <ExternalLink :size="18" class="text-primary" />
              {{ t('servers.admin_url') }}
            </label>
            <input
              id="adminUrl"
              v-model="form.adminUrl"
              type="url"
              :class="[
                'block w-full border rounded-lg px-3 py-2 text-base focus:ring-2 transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white',
                !isAdminUrlValid && form.adminUrl
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary focus:border-primary',
              ]"
              :placeholder="t('servers.admin_url_placeholder')"
            />
            <p
              v-if="!isAdminUrlValid && form.adminUrl"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ t('validation.invalid_url') }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('servers.authentication_title') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="login"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <User :size="18" class="text-primary" />
              {{ t('servers.login') }}
            </label>
            <input
              id="login"
              v-model="form.login"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              :placeholder="t('servers.login_placeholder')"
              required
            />
          </div>
          <div>
            <label
              for="password"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Key :size="18" class="text-primary" />
              {{ t('servers.password') }}
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showServerPassword ? 'text' : 'password'"
                class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 pr-10 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                :placeholder="t('servers.password_placeholder')"
                required
              />
              <button
                type="button"
                @click="showServerPassword = !showServerPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <Eye v-if="!showServerPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="form.type === 'esxi'">
        <h3
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2"
        >
          {{ t('servers.ilo_section') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="ilo_name"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Server :size="18" class="text-primary" />
              {{ t('servers.ilo_name') }}
            </label>
            <input
              id="ilo_name"
              v-model="form.ilo.name"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              :placeholder="t('servers.ilo_name')"
            />
          </div>
          <div>
            <label
              for="ilo_ip"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Globe :size="18" class="text-primary" />
              {{ t('servers.ilo_ip') }}
            </label>
            <input
              id="ilo_ip"
              v-model="form.ilo.ip"
              type="text"
              :class="[
                'block w-full border rounded-lg px-3 py-2 text-base focus:ring-2 transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white',
                !isIloIpValid && form.ilo.ip
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary focus:border-primary',
              ]"
              :placeholder="t('servers.ilo_ip')"
              :pattern="ipv4Pattern"
            />
            <p
              v-if="!isIloIpValid && form.ilo.ip"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ t('validation.invalid_ip') }}
            </p>
            <ConnectivityTest
              v-if="form.ilo.ip && ipv4Regex.test(form.ilo.ip)"
              :ip="form.ilo.ip"
              :ping-function="() => pingIloByIp(form.ilo.ip)"
              :disabled="!form.ilo.ip || !ipv4Regex.test(form.ilo.ip)"
              class="mt-2"
            />
          </div>
          <div>
            <label
              for="ilo_login"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <User :size="18" class="text-primary" />
              {{ t('servers.ilo_login') }}
            </label>
            <input
              id="ilo_login"
              v-model="form.ilo.login"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              :placeholder="t('servers.ilo_login')"
            />
          </div>
          <div>
            <label
              for="ilo_password"
              class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
            >
              <Key :size="18" class="text-primary" />
              {{ t('servers.ilo_password') }}
            </label>
            <div class="relative">
              <input
                id="ilo_password"
                v-model="form.ilo.password"
                :type="showIloPassword ? 'text' : 'password'"
                class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 pr-10 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                :placeholder="t('servers.ilo_password')"
              />
              <button
                type="button"
                @click="showIloPassword = !showIloPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <Eye v-if="!showIloPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg px-4 py-3 text-blue-900 dark:text-blue-300 text-sm"
      >
        <Info
          :size="18"
          class="flex-shrink-0 text-blue-500 dark:text-blue-400"
        />
        <span>{{ t('servers.creation_info') }}</span>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          :class="[
            'inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-6 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition',
            isFormValid && !isSubmitting
              ? 'bg-primary text-white hover:bg-primary-dark focus:ring-primary'
              : 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed',
          ]"
        >
          <Server v-if="!isSubmitting" :size="18" />
          <div
            v-else
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ isSubmitting ? t('servers.submitting') : t('servers.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Server,
  Building2,
  BatteryCharging,
  Cpu,
  Star,
  Globe,
  ExternalLink,
  User,
  Key,
  Info,
  Eye,
  EyeOff,
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { ipv4Pattern, ipv4Regex, urlRegex } from '@/utils/regex';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import type { RoomResponseDto } from '@/features/rooms/types';
import type { UpsResponseDto } from '@/features/ups/types';
import type { CreateServerPayload } from '@/features/servers/types';
import PriorityInput from '@/features/groups/components/PriorityInput.vue';
import ConnectivityTest from '@/shared/components/ConnectivityTest.vue';
import { pingServerByIp, pingIloByIp } from '@/features/servers/api';

interface Props {
  isSubmitting?: boolean;
}

interface Emits {
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const toast = useToast();
const { t } = useI18n();

const availableRooms = ref<RoomResponseDto[]>([]);
const availableUps = ref<UpsResponseDto[]>([]);
const isLoadingRooms = ref(false);
const isLoadingUps = ref(false);

const canSelectRoom = computed(
  () => availableRooms.value.length > 0 && !isLoadingRooms.value,
);

const canSelectUps = computed(() => !isLoadingUps.value);

const form = reactive({
  name: '',
  ip: '',
  adminUrl: '',
  login: '',
  password: '',
  type: 'vcenter' as 'vcenter' | 'esxi',
  priority: 1,
  roomId: '',
  upsId: '',
  ilo: {
    name: '',
    ip: '',
    login: '',
    password: '',
  },
});

const showServerPassword = ref(false);
const showIloPassword = ref(false);

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
    form.password &&
    form.roomId &&
    isIpValid.value &&
    isAdminUrlValid.value;

  if (form.type === 'esxi') {
    return baseValid && isIloIpValid.value;
  }

  return baseValid;
});

const loadAvailableRooms = async () => {
  try {
    isLoadingRooms.value = true;
    const response = await roomApi.fetchRooms();
    availableRooms.value = response.items || [];

    if (availableRooms.value.length === 1) {
      form.roomId = availableRooms.value[0].id;
    }
  } catch {
    toast.error(t('servers.load_rooms_error'));
  } finally {
    isLoadingRooms.value = false;
  }
};

const loadAvailableUps = async () => {
  try {
    isLoadingUps.value = true;
    const response = await upsApi.getAllPaginated(1, 100);
    availableUps.value = response.items || [];
  } catch {
  } finally {
    isLoadingUps.value = false;
  }
};

onMounted(() => {
  loadAvailableRooms();
  loadAvailableUps();
});

const handleSubmit = async () => {
  if (!form.name?.trim()) return toast.error(t('servers.name_required'));
  if (!ipv4Regex.test(form.ip ?? ''))
    return toast.error(t('servers.ip_invalid'));
  if (!form.login?.trim()) return toast.error(t('servers.login_required'));
  if (!form.password) return toast.error(t('servers.password_required'));
  if (!form.roomId) return toast.error(t('servers.select_room_error'));

  const creationDto: CreateServerPayload = {
    name: form.name.trim(),
    ip: form.ip.trim(),
    adminUrl: form.adminUrl?.trim() || '',
    login: form.login.trim(),
    password: form.password,
    type: form.type,
    priority: form.priority,
    roomId: form.roomId,
    upsId: form.upsId || undefined,
    state: 'UP' as const,
  };

  if (form.type === 'esxi') {
    creationDto.ilo = {
      name: form.ilo.name.trim(),
      ip: form.ilo.ip.trim(),
      login: form.ilo.login.trim(),
      password: form.ilo.password,
    };
  }

  emit('submit', creationDto);
};
</script>
