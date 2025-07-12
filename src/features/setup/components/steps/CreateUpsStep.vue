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
      <p
        class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto"
      >
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
          <Building2 :size="18" class="text-primary dark:text-blue-400" />
          {{ t('setup_ups.room_label') }}
        </label>
        <select
          id="roomId"
          v-model="form.roomId"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :class="{ 'bg-gray-100': !canSelectRoom }"
          :disabled="!canSelectRoom || props.isReadOnly"
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
          <BatteryCharging :size="18" class="text-primary dark:text-blue-400" />
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
          :disabled="props.isReadOnly"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">{{
          t('setup_ups.name_hint')
        }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="ip"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Zap :size="18" class="text-primary dark:text-blue-400" />
            {{ t('setup_ups.ip_label') }}
          </label>
          <div class="space-y-2">
            <input
              id="ip"
              v-model="form.ip"
              type="text"
              class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
              :placeholder="t('setup_ups.ip_placeholder')"
              :pattern="ipv4Pattern"
              required
              :disabled="props.isReadOnly"
            />
            <ConnectivityTest
              v-if="form.ip && !props.isReadOnly"
              :ip="form.ip"
              :ping-function="testUpsPing"
              :disabled="!ipv4Regex.test(form.ip)"
            />
            <span
              v-if="savedUpsId && form.ip && ipv4Regex.test(form.ip)"
              class="text-xs text-blue-600 dark:text-blue-400 block"
            >
              💾 {{ t('connectivity.saved_for_validation') }}
            </span>
            <span
              class="text-xs text-neutral dark:text-neutral-400 mt-1 block"
              >{{ t('setup_ups.ip_hint') }}</span
            >
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
        <span>{{ t('setup_ups.warning') }}</span>
      </div>

      <button
        v-if="!props.isReadOnly"
        type="submit"
        :disabled="isSubmitting || setupStore.isLoading"
        class="mt-8 inline-flex items-center justify-center gap-2 bg-primary dark:bg-blue-600 text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-800 transition active:scale-95 disabled:opacity-60"
      >
        <BatteryCharging :size="20" />
        {{ isSubmitting ? t('setup_ups.submitting') : t('setup_ups.submit') }}
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
import { reactive, computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  BatteryCharging,
  Zap,
  Building2,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { useSetupStore } from '../../store';
import { SetupStep } from '../../types';
import { upsApi } from '@/features/ups/api';
import { ipv4Pattern, ipv4Regex } from '@/utils/regex';
import { roomApi } from '@/features/rooms/api';
import type { RoomResponseDto } from '@/features/rooms/types';
import ConnectivityTest from '@/shared/components/ConnectivityTest.vue';

interface Props {
  isReadOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReadOnly: false,
});

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
  roomId: roomData.id || '',
});

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

onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }
  loadAvailableRooms();

  if (props.isReadOnly) {
    const savedData = setupStore.getStepData(SetupStep.CREATE_UPS);
    if (savedData) {
      form.name = savedData.name || '';
      form.ip = savedData.ip || '';
      form.roomId = savedData.roomId || roomData.id || '';
    }
  }
});

let savedUpsId: string | null = null;

const testUpsPing = async (ip: string) => {
  if (!savedUpsId) {
    const payload = {
      name: form.name.trim() || 'temp-validation-ups',
      ip: ip.trim(),
      roomId: form.roomId,
    };
    const savedUps = await upsApi.create(payload);
    savedUpsId = savedUps.id;
  } else {
    await upsApi.update(savedUpsId, {
      ip: ip.trim(),
      name: form.name.trim() || 'temp-validation-ups',
    });
  }

  return await upsApi.ping(savedUpsId);
};

const handleSubmit = async () => {
  if (!form.name?.trim()) return toast.error(t('setup_ups.name_required'));
  if (!ipv4Regex.test(form.ip ?? ''))
    return toast.error(t('setup_ups.ip_invalid'));
  if (!form.roomId) return toast.error(t('setup_ups.select_room_error'));

  try {
    isSubmitting.value = true;
    setupStore.isLoading = true;

    let upsId: string;

    if (savedUpsId) {
      await upsApi.update(savedUpsId, {
        name: form.name.trim(),
        ip: form.ip.trim(),
        roomId: form.roomId,
      });
      upsId = savedUpsId;
      toast.success(t('toast.ups_updated'));
    } else {
      const payload = {
        name: form.name.trim(),
        ip: form.ip.trim(),
        roomId: form.roomId,
      };
      const createdUps = await upsApi.create(payload);
      upsId = createdUps.id;
      toast.success(t('toast.ups_created'));
    }

    await setupStore.completeSetupStep(SetupStep.CREATE_UPS, {
      ...form,
      id: upsId,
    });
  } catch (error: unknown) {
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
