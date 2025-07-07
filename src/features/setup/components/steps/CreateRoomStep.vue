<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup_room.title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto"
      >
        <span v-html="t('setup_room.description')" />
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-6"
      autocomplete="off"
    >
      <div>
        <label
          for="name"
          class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
        >
          <Building2 :size="18" class="text-primary dark:text-blue-400" />
          {{ t('setup_room.name_label') }}
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition dark:bg-neutral-700 dark:border-neutral-600 dark:focus:ring-primary dark:focus:border-primary"
          :placeholder="t('setup_room.name_placeholder')"
          required
          maxlength="64"
          autocomplete="off"
          :disabled="props.isReadOnly"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">
          {{ t('setup_room.name_hint') }}
        </span>
      </div>

      <div>
        <label
          for="location"
          class="block font-medium text-neutral-darker flex items-center gap-2 mb-1 dark:text-neutral-300"
        >
          <MapPin :size="18" class="text-primary dark:text-blue-400" />
          {{ t('setup_room.location_label') }}
        </label>
        <textarea
          id="location"
          v-model="form.location"
          class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-primary transition dark:bg-neutral-700 dark:border-neutral-600 dark:focus:ring-primary dark:focus:border-primary"
          :placeholder="t('setup_room.location_placeholder')"
          rows="2"
          required
          maxlength="128"
          :disabled="props.isReadOnly"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">
          {{ t('setup_room.location_hint') }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            for="capacity"
            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1 dark:text-neutral-300"
          >
            <Server :size="18" class="text-primary dark:text-blue-400" />
            {{ t('setup_room.capacity_label') }}
          </label>
          <input
            id="capacity"
            v-model.number="form.capacity"
            type="number"
            min="1"
            max="1000"
            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition dark:bg-neutral-700 dark:border-neutral-600 dark:focus:ring-primary dark:focus:border-primary"
            required
            :disabled="props.isReadOnly"
          />
          <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">{{
            t('setup_room.capacity_hint')
          }}</span>
        </div>
        <div>
          <label
            for="coolingType"
            class="block font-medium text-neutral-darker dark:text-neutral-300 flex items-center gap-2 mb-1"
          >
            <Wind :size="18" class="text-primary dark:text-blue-400" />
            {{ t('setup_room.cooling_label') }}
          </label>
          <select
            id="coolingType"
            v-model="form.coolingType"
            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:focus:ring-primary dark:focus:border-primary"
            required
            :disabled="props.isReadOnly"
          >
            <option value="air">{{ t('setup_room.cooling_air') }}</option>
            <option value="liquid">{{ t('setup_room.cooling_liquid') }}</option>
            <option value="free">{{ t('setup_room.cooling_free') }}</option>
            <option value="hybrid">{{ t('setup_room.cooling_hybrid') }}</option>
          </select>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mt-2 text-primary-dark text-sm dark:bg-primary/10 dark:border-primary/30 dark:text-primary-light"
      >
        <Info
          :size="18"
          class="flex-shrink-0 text-primary dark:text-blue-400"
        />
        <span v-html="t('setup_room.default_info')" />
      </div>

      <div v-if="error" class="text-danger text-sm text-center mt-4">
        {{ error }}
      </div>

      <button
        v-if="!props.isReadOnly"
        type="submit"
        :disabled="setupStore.isLoading"
        class="mt-6 inline-flex items-center justify-center gap-2 bg-primary dark:bg-blue-600 text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-800 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Building2 :size="20" />
        {{ t('setup_room.submit') }}
      </button>
      <div
        v-else
        class="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400"
      >
        <Info :size="16" class="inline mr-2" />
        {{ t('setup.read_only_message') }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, MapPin, Server, Wind, Info } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { SetupStep } from '../../types';
import { roomApi } from '@/features/rooms/api';

interface Props {
  isReadOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReadOnly: false,
});

const setupStore = useSetupStore();
const toast = useToast();
const error = ref<string | null>(null);
const { t } = useI18n();

const form = reactive({
  name: '',
  location: '',
  capacity: 10,
  coolingType: 'air' as const,
});

onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }

  if (props.isReadOnly) {
    const savedData = setupStore.getStepData(SetupStep.CREATE_ROOM);
    if (savedData) {
      form.name = savedData.name || '';
      form.location = savedData.location || '';
      form.capacity = savedData.capacity || 10;
      form.coolingType = savedData.coolingType || 'air';
    }
  }
});

const handleSubmit = async () => {
  try {
    setupStore.isLoading = true;
    error.value = null;

    const createdRoom = await roomApi.createRoom({
      name: form.name,
    });

    await setupStore.completeSetupStep(SetupStep.CREATE_ROOM, {
      id: createdRoom.id,
      name: form.name,
      location: form.location,
      capacity: form.capacity,
      coolingType: form.coolingType,
    });

    toast.success(t('toast.room_created'));
  } catch (e: any) {
    error.value = e.response?.data?.message || t('setup_room.error');
    toast.error(error.value ?? t('setup_room.error'));
  } finally {
    setupStore.isLoading = false;
  }
};
</script>
