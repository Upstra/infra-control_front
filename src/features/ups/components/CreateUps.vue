<template>
  <div class="w-full max-w-2xl">
    <div class="mb-6 text-center">
      <h2
        class="text-2xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('ups.create_title') }}
      </h2>
      <p class="mt-2 text-base text-neutral-dark dark:text-neutral-300">
        {{ t('ups.create_description') }}
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-6"
      autocomplete="off"
    >
      <div>
        <label
          for="roomId"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <Building2 :size="18" class="text-primary" />
          {{ t('ups.room_label') }}
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
            {{ t('ups.no_room') }}
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
          {{ t('ups.select_room') }}
        </span>
        <span
          v-else-if="isLoadingRooms"
          class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
        >
          {{ t('ups.loading_rooms') }}
        </span>
      </div>

      <div>
        <label
          for="name"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <BatteryCharging :size="18" class="text-primary" />
          {{ t('ups.name') }}
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          :placeholder="t('ups.name_placeholder')"
          required
          maxlength="64"
        />
        <span class="text-xs text-neutral mt-1 block">{{
          t('ups.name_hint')
        }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="ip"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Zap :size="18" class="text-primary" />
            {{ t('ups.ip') }}
          </label>
          <input
            id="ip"
            v-model="form.ip"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            :placeholder="t('ups.ip_placeholder')"
            :pattern="ipv4Pattern"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('ups.ip_hint')
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
            {{ t('ups.brand_label') }}
          </label>
          <select
            id="brand"
            v-model="form.brand"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
          >
            <option value="">{{ t('ups.brand_select') }}</option>
            <option value="APC">APC</option>
            <option value="Eaton">Eaton</option>
            <option value="Schneider">Schneider Electric</option>
            <option value="Vertiv">Vertiv</option>
            <option value="ABB">ABB</option>
            <option value="Other">{{ t('ups.brand_other') }}</option>
          </select>
        </div>
        <div>
          <label
            for="model"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Hash :size="18" class="text-primary" />
            {{ t('ups.model_label') }}
          </label>
          <input
            id="model"
            v-model="form.model"
            type="text"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            :placeholder="t('ups.model_placeholder')"
          />
        </div>
      </div>

      <div>
        <label
          for="capacity"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <Zap :size="18" class="text-primary" />
          {{ t('ups.capacity_label') }}
        </label>
        <input
          id="capacity"
          v-model.number="form.capacity"
          type="number"
          class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
          min="1"
          step="0.1"
          :placeholder="t('ups.capacity_placeholder')"
        />
        <span class="text-xs text-neutral mt-1 block">{{
          t('ups.capacity_hint')
        }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div
          class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-lg p-4"
        >
          <Clock :size="22" class="text-primary" />
          <div>
            <span
              class="font-semibold text-neutral-dark dark:text-neutral-300"
              >{{ t('ups.runtime_title') }}</span
            >
            <p class="text-xs text-neutral dark:text-neutral-400 mt-1">
              {{ t('ups.runtime_text', { minutes: estimatedRuntime }) }}
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-lg p-4"
        >
          <Server :size="22" class="text-primary" />
          <div>
            <span
              class="font-semibold text-neutral-dark dark:text-neutral-300"
              >{{ t('ups.server_capacity_title') }}</span
            >
            <p class="text-xs text-neutral dark:text-neutral-400 mt-1">
              {{
                t('ups.server_capacity_text', {
                  count: estimatedServerCapacity,
                })
              }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg px-4 py-3 mt-2 text-yellow-900 dark:text-yellow-300 text-sm"
      >
        <AlertTriangle
          :size="18"
          class="flex-shrink-0 text-yellow-500 dark:text-yellow-400"
        />
        <span>{{ t('ups.warning') }}</span>
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
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-lg px-6 py-2 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:opacity-60"
        >
          <BatteryCharging v-if="!isSubmitting" :size="18" />
          <div
            v-else
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ isSubmitting ? t('ups.submitting') : t('ups.submit') }}
        </button>
      </div>
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
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { ipv4Pattern, ipv4Regex } from '@/utils/regex';
import { roomApi } from '@/features/rooms/api';
import type { RoomResponseDto } from '@/features/rooms/types';

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
const isLoadingRooms = ref(false);

const canSelectRoom = computed(
  () => availableRooms.value.length > 0 && !isLoadingRooms.value,
);

const form = reactive({
  name: '',
  ip: '',
  roomId: '',
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

    if (availableRooms.value.length === 1) {
      form.roomId = availableRooms.value[0].id;
    }
  } catch {
    toast.error(t('ups.load_rooms_error'));
  } finally {
    isLoadingRooms.value = false;
  }
};

onMounted(() => {
  loadAvailableRooms();
});

const handleSubmit = async () => {
  if (!form.name?.trim()) return toast.error(t('ups.name_required'));
  if (!ipv4Regex.test(form.ip ?? '')) return toast.error(t('ups.ip_invalid'));
  if (!form.roomId) return toast.error(t('ups.select_room_error'));

  const creationDto = {
    name: form.name.trim(),
    ip: form.ip.trim(),
    roomId: form.roomId,
  };

  emit('submit', creationDto);
};
</script>
