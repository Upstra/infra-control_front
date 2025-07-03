<template>
  <div class="w-full max-w-xl">
    <div class="mb-6 text-center">
      <h2
        class="text-2xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('rooms.create_title') }}
      </h2>
      <p class="mt-2 text-base text-neutral-dark dark:text-neutral-400">
        {{ t('rooms.create_description') }}
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-6"
      autocomplete="off"
    >
      <div>
        <label
          for="name"
          class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
        >
          <Building2 :size="18" class="text-primary dark:text-blue-400" />
          {{ t('rooms.name') }}
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('rooms.name_placeholder')"
          required
          maxlength="64"
          autocomplete="off"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">
          {{ t('rooms.name_hint') }}
        </span>
      </div>

      <div>
        <label
          for="location"
          class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
        >
          <MapPin :size="18" class="text-primary dark:text-blue-400" />
          {{ t('rooms.location') }}
        </label>
        <textarea
          id="location"
          v-model="form.location"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('rooms.location_placeholder')"
          rows="3"
          required
          maxlength="128"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">
          {{ t('rooms.location_hint') }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            for="capacity"
            class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
          >
            <Server :size="18" class="text-primary dark:text-blue-400" />
            {{ t('rooms.capacity') }}
          </label>
          <input
            id="capacity"
            v-model.number="form.capacity"
            type="number"
            min="1"
            max="1000"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('rooms.capacity_placeholder')"
            required
          />
          <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">{{
            t('rooms.capacity_hint')
          }}</span>
        </div>
        <div>
          <label
            for="coolingType"
            class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
          >
            <Wind :size="18" class="text-primary dark:text-blue-400" />
            {{ t('rooms.cooling_type') }}
          </label>
          <select
            id="coolingType"
            v-model="form.coolingType"
            class="block w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            required
          >
            <option value="air">{{ t('rooms.cooling_air') }}</option>
            <option value="liquid">{{ t('rooms.cooling_liquid') }}</option>
            <option value="hybrid">{{ t('rooms.cooling_hybrid') }}</option>
            <option value="none">{{ t('rooms.cooling_none') }}</option>
          </select>
          <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">{{
            t('rooms.cooling_hint')
          }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            for="temperature"
            class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
          >
            <Thermometer :size="18" class="text-primary dark:text-blue-400" />
            {{ t('rooms.temperature') }}
          </label>
          <input
            id="temperature"
            v-model.number="form.temperature"
            type="number"
            min="10"
            max="50"
            step="0.1"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('rooms.temperature_placeholder')"
          />
          <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">{{
            t('rooms.temperature_hint')
          }}</span>
        </div>
        <div>
          <label
            for="humidity"
            class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
          >
            <Droplets :size="18" class="text-primary dark:text-blue-400" />
            {{ t('rooms.humidity') }}
          </label>
          <input
            id="humidity"
            v-model.number="form.humidity"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            :placeholder="t('rooms.humidity_placeholder')"
          />
          <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">{{
            t('rooms.humidity_hint')
          }}</span>
        </div>
      </div>

      <div>
        <label
          for="description"
          class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
        >
          <FileText :size="18" class="text-primary dark:text-blue-400" />
          {{ t('rooms.description') }}
        </label>
        <textarea
          id="description"
          v-model="form.description"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('rooms.description_placeholder')"
          rows="3"
          maxlength="255"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">
          {{ t('rooms.description_hint') }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div
          class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-lg p-4"
        >
          <Server :size="22" class="text-primary dark:text-blue-400" />
          <div>
            <span
              class="font-semibold text-neutral-dark dark:text-neutral-300"
              >{{ t('rooms.capacity_info_title') }}</span
            >
            <p class="text-xs text-neutral dark:text-neutral-400 mt-1">
              {{
                t('rooms.capacity_info_text', { capacity: form.capacity || 0 })
              }}
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-lg p-4"
        >
          <Thermometer :size="22" class="text-primary dark:text-blue-400" />
          <div>
            <span
              class="font-semibold text-neutral-dark dark:text-neutral-300"
              >{{ t('rooms.environment_title') }}</span
            >
            <p class="text-xs text-neutral dark:text-neutral-400 mt-1">
              {{ getEnvironmentStatus() }}
            </p>
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
        <span>{{ t('rooms.creation_info') }}</span>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 bg-primary dark:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2 shadow-md hover:bg-primary-dark dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:opacity-60"
        >
          <Building2 v-if="!isSubmitting" :size="18" />
          <div
            v-else
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ isSubmitting ? t('rooms.submitting') : t('rooms.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Building2,
  MapPin,
  Server,
  Wind,
  Thermometer,
  Droplets,
  FileText,
  Info,
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';

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

const form = reactive({
  name: '',
  location: '',
  capacity: 10,
  coolingType: 'air' as 'air' | 'liquid' | 'hybrid' | 'none',
  temperature: 20,
  humidity: 45,
  description: '',
});

const getEnvironmentStatus = () => {
  if (form.temperature && form.humidity) {
    if (
      form.temperature >= 18 &&
      form.temperature <= 25 &&
      form.humidity >= 40 &&
      form.humidity <= 60
    ) {
      return t('rooms.environment_optimal');
    } else if (
      form.temperature >= 15 &&
      form.temperature <= 30 &&
      form.humidity >= 30 &&
      form.humidity <= 70
    ) {
      return t('rooms.environment_acceptable');
    } else {
      return t('rooms.environment_warning');
    }
  }
  return t('rooms.environment_not_set');
};

const handleSubmit = async () => {
  if (!form.name?.trim()) return toast.error(t('rooms.name_required'));
  if (!form.location?.trim()) return toast.error(t('rooms.location_required'));
  if (form.capacity < 1) return toast.error(t('rooms.capacity_invalid'));

  const creationDto = {
    name: form.name.trim(),
    location: form.location.trim(),
    capacity: form.capacity,
    coolingType: form.coolingType,
    temperature: form.temperature,
    humidity: form.humidity,
    description: form.description?.trim() || '',
  };

  emit('submit', creationDto);
};
</script>
