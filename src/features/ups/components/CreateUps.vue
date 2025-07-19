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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="grace_period_on"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Clock :size="18" class="text-primary" />
            {{ t('ups.grace_period_on') }}
          </label>
          <input
            id="grace_period_on"
            v-model.number="form.grace_period_on"
            type="number"
            min="0"
            max="3600"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            :placeholder="t('ups.grace_period_on_placeholder')"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('ups.grace_period_on_hint')
          }}</span>
        </div>
        <div>
          <label
            for="grace_period_off"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Clock :size="18" class="text-primary" />
            {{ t('ups.grace_period_off') }}
          </label>
          <input
            id="grace_period_off"
            v-model.number="form.grace_period_off"
            type="number"
            min="0"
            max="3600"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            :placeholder="t('ups.grace_period_off_placeholder')"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('ups.grace_period_off_hint')
          }}</span>
        </div>
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
import { BatteryCharging, Zap, Building2, Clock } from 'lucide-vue-next';
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
  grace_period_on: 30,
  grace_period_off: 60,
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
    grace_period_on: form.grace_period_on,
    grace_period_off: form.grace_period_off,
  };

  emit('submit', creationDto);
};
</script>
