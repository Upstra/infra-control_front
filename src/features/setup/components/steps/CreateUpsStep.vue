<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup_ups.title') }}
      </h2>
      <p class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto">
        {{ t('setup_ups.description') }}
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-xl bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-6"
      autocomplete="off"
    >
      <div>
        <label
          for="roomId"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <Building2 :size="18" class="text-primary" />
          {{ t('setup_ups.room_label') }}
        </label>
        <select
          id="roomId"
          v-model="form.roomId"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :class="{ 'bg-gray-100': !canSelectRoom }"
          :disabled="!canSelectRoom"
          required
        >
          <option v-if="!availableRooms.length" disabled value="">
            {{ t('setup_ups.no_room') }}
          </option>
          <option
            v-for="room in availableRooms"
            :key="room.id"
            :value="room.id"
          >
            {{ room.name }}
          </option>
        </select>

        <span v-if="isUsingSetupRoom" class="text-xs text-primary mt-1 block">
          <CheckCircle :size="14" class="inline mr-1" />
          {{ t('setup_ups.room_created') }}
        </span>
        <span
          v-else-if="availableRooms.length > 1"
          class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
        >
          {{ t('setup_ups.select_room') }}
        </span>
        <span
          v-else-if="isLoadingRooms"
          class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
        >
          {{ t('setup_ups.loading_rooms') }}
        </span>
      </div>

      <div>
        <label
          for="name"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <BatteryCharging :size="18" class="text-primary" />
          {{ t('setup_ups.name_label') }}
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('setup_ups.name_placeholder')"
          required
          maxlength="64"
        />
        <span class="text-xs text-neutral mt-1 block">{{
          t('setup_ups.name_hint')
        }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="ip"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Zap :size="18" class="text-primary" />
            {{ t('setup_ups.ip_label') }}
          </label>
          <input
            id="ip"
            v-model="form.ip"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('setup_ups.ip_placeholder')"
            :pattern="ipv4Pattern"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('setup_ups.ip_hint')
          }}</span>
        </div>
        <div>
          <label
            for="login"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <User :size="18" class="text-primary" />
            {{ t('setup_ups.login_label') }}
          </label>
          <input
            id="login"
            v-model="form.login"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('setup_ups.login_placeholder')"
            required
          />
        </div>
      </div>

      <div>
        <label
          for="password"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <Key :size="18" class="text-primary" />
          {{ t('setup_ups.password_label') }}
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('setup_ups.password_placeholder')"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="grace_period_on"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Clock :size="18" class="text-primary" />
            {{ t('setup_ups.grace_on_label') }}
          </label>
          <input
            id="grace_period_on"
            v-model.number="form.grace_period_on"
            type="number"
            min="0"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('setup_ups.grace_on_placeholder')"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('setup_ups.grace_on_hint')
          }}</span>
        </div>
        <div>
          <label
            for="grace_period_off"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Clock :size="18" class="text-primary" />
            {{ t('setup_ups.grace_off_label') }}
          </label>
          <input
            id="grace_period_off"
            v-model.number="form.grace_period_off"
            type="number"
            min="0"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('setup_ups.grace_off_placeholder')"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('setup_ups.grace_off_hint')
          }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="brand"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Package :size="18" class="text-primary" />
            {{ t('setup_ups.brand_label') }}
          </label>
          <select
            id="brand"
            v-model="form.brand"
            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
          >
            <option value="">{{ t('setup_ups.brand_select') }}</option>
            <option value="APC">APC</option>
            <option value="Eaton">Eaton</option>
            <option value="Schneider">Schneider Electric</option>
            <option value="Vertiv">Vertiv</option>
            <option value="ABB">ABB</option>
            <option value="Other">{{ t('setup_ups.brand_other') }}</option>
          </select>
        </div>
        <div>
          <label
            for="model"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Hash :size="18" class="text-primary" />
            {{ t('setup_ups.model_label') }}
          </label>
          <input
            id="model"
            v-model="form.model"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('setup_ups.model_placeholder')"
          />
        </div>
      </div>

      <div>
        <label
          for="capacity"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <Zap :size="18" class="text-primary" />
          {{ t('setup_ups.capacity_label') }}
        </label>
        <input
          id="capacity"
          v-model.number="form.capacity"
          type="number"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          min="1"
          step="0.1"
          :placeholder="t('setup_ups.capacity_placeholder')"
        />
        <span class="text-xs text-neutral mt-1 block">{{
          t('setup_ups.capacity_hint')
        }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="flex items-center gap-3 bg-primary/5 rounded-lg p-4">
          <Clock :size="22" class="text-primary" />
          <div>
            <span class="font-semibold text-neutral-dark">{{
              t('setup_ups.runtime_title')
            }}</span>
            <p class="text-xs text-neutral mt-1">
              {{ t('setup_ups.runtime_text', { minutes: estimatedRuntime }) }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 bg-primary/5 rounded-lg p-4">
          <Server :size="22" class="text-primary" />
          <div>
            <span class="font-semibold text-neutral-dark">{{
              t('setup_ups.server_capacity_title')
            }}</span>
            <p class="text-xs text-neutral mt-1">
              {{
                t('setup_ups.server_capacity_text', {
                  count: estimatedServerCapacity,
                })
              }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 mt-2 text-yellow-900 text-sm"
      >
        <AlertTriangle :size="18" class="flex-shrink-0 text-yellow-500" />
        <span>{{ t('setup_ups.warning') }}</span>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting || setupStore.isLoading"
        class="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95 disabled:opacity-60"
      >
        <BatteryCharging :size="20" />
        {{ isSubmitting ? t('setup_ups.submitting') : t('setup_ups.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  BatteryCharging,
  Package,
  Hash,
  Zap,
  Building2,
  Clock,
  Server,
  AlertTriangle,
  User,
  Key,
  CheckCircle,
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { useSetupStore } from '../../store';
import { SetupStep } from '../../types';
import { upsApi } from '@/features/ups/api';
import { ipv4Pattern, ipv4Regex } from '@/utils/regex';
import { roomApi } from '@/features/rooms/api';
import type { RoomResponseDto } from '@/features/rooms/types';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

const availableRooms = ref<RoomResponseDto[]>([]);
const isLoadingRooms = ref(false);
const isSubmitting = ref(false);

const roomData = setupStore.getStepData(SetupStep.CREATE_ROOM);

const isUsingSetupRoom = computed(
  () => roomData.id && form.roomId === roomData.id,
);

const canSelectRoom = computed(
  () => availableRooms.value.length > 0 && !isLoadingRooms.value,
);

const form = reactive({
  name: '',
  ip: '',
  login: '',
  password: '',
  grace_period_on: 60,
  grace_period_off: 30,
  roomId: roomData.id || '',
  brand: '',
  model: '',
  capacity: 3,
});

const estimatedRuntime = computed(() => Math.round(form.capacity * 10));
const estimatedServerCapacity = computed(() => Math.floor(form.capacity / 0.5));

const loadAvailableRooms = async () => {
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
        name: roomData.name || t('setup_ups.default_room_setup'),
      });
    }

    if (availableRooms.value.length === 1) {
      form.roomId = availableRooms.value[0].id;
    }
  } catch {
    if (roomData.id) {
      availableRooms.value = [
        {
          id: roomData.id,
          name: roomData.name || t('setup_ups.default_room_main'),
        },
      ];
      form.roomId = roomData.id;
    } else {
      toast.error(t('setup_ups.load_rooms_error'));
    }
  } finally {
    isLoadingRooms.value = false;
  }
};

onMounted(() => {
  loadAvailableRooms();
});

const handleSubmit = async () => {
  if (!form.name?.trim()) return toast.error(t('setup_ups.name_required'));
  if (!ipv4Regex.test(form.ip ?? ''))
    return toast.error(t('setup_ups.ip_invalid'));
  if (!form.login?.trim()) return toast.error(t('setup_ups.login_required'));
  if (!form.password) return toast.error(t('setup_ups.password_required'));
  if (!form.roomId) return toast.error(t('setup_ups.select_room_error'));
  if (form.grace_period_on < 0 || form.grace_period_off < 0)
    return toast.error(t('setup_ups.negative_delay_error'));

  const creationDto = {
    name: form.name.trim(),
    ip: form.ip.trim(),
    login: form.login.trim(),
    password: form.password,
    grace_period_on: form.grace_period_on,
    grace_period_off: form.grace_period_off,
    roomId: form.roomId,
    //TODO: voir si on garde ou en optionnel
    //...(form.brand && { brand: form.brand }),
    //...(form.model && { model: form.model }),
    //...(form.capacity && { capacity: form.capacity }),
  };

  try {
    isSubmitting.value = true;
    setupStore.isLoading = true;

    const createdUps = await upsApi.create(creationDto);

    //TODO: envoyer que les champs stricts ou toute la form (voir backend)
    await setupStore.completeSetupStep(SetupStep.CREATE_UPS, {
      ...form,
      id: createdUps.id,
    });

    toast.success(t('toast.ups_created'));
    //TODO: gestion navigation selon backend (redirigé auto ou non)
  } catch (error: unknown) {
    //TODO: améliorer gestion des erreurs si besoin
    const err = error as any;
    const errorMessage =
      err.response?.data?.message || err.message || t('setup_ups.error');
    toast.error(errorMessage);
  } finally {
    isSubmitting.value = false;
    setupStore.isLoading = false;
  }
};
</script>
