<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker tracking-tight"
      >
        {{ t('setup_room.title') }}
      </h2>
      <p class="mt-2 text-base md:text-lg text-neutral-dark max-w-lg mx-auto">
        <span v-html="t('setup_room.description')" />
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-lg bg-white rounded-2xl shadow-md border border-neutral-100 p-8 flex flex-col gap-6"
      autocomplete="off"
    >
      <div>
        <label
          for="name"
          class="block font-medium text-neutral-darker flex items-center gap-2 mb-1"
        >
          <Building2 :size="18" class="text-primary" />
          {{ t('setup_room.name_label') }}
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('setup_room.name_placeholder')"
          required
          maxlength="64"
          autocomplete="off"
        />
        <span class="text-xs text-neutral mt-1 block">
          {{ t('setup_room.name_hint') }}
        </span>
      </div>

      <div>
        <label
          for="location"
          class="block font-medium text-neutral-darker flex items-center gap-2 mb-1"
        >
          <MapPin :size="18" class="text-primary" />
          {{ t('setup_room.location_label') }}
        </label>
        <textarea
          id="location"
          v-model="form.location"
          class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('setup_room.location_placeholder')"
          rows="2"
          required
          maxlength="128"
        />
        <span class="text-xs text-neutral mt-1 block">
          {{ t('setup_room.location_hint') }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            for="capacity"
            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1"
          >
            <Server :size="18" class="text-primary" />
            {{ t('setup_room.capacity_label') }}
          </label>
          <input
            id="capacity"
            v-model.number="form.capacity"
            type="number"
            min="1"
            max="1000"
            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
            required
          />
          <span class="text-xs text-neutral mt-1 block">{{
            t('setup_room.capacity_hint')
          }}</span>
        </div>
        <div>
          <label
            for="coolingType"
            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1"
          >
            <Wind :size="18" class="text-primary" />
            {{ t('setup_room.cooling_label') }}
          </label>
          <select
            id="coolingType"
            v-model="form.coolingType"
            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
            required
          >
            <option value="air">{{ t('setup_room.cooling_air') }}</option>
            <option value="liquid">{{ t('setup_room.cooling_liquid') }}</option>
            <option value="free">{{ t('setup_room.cooling_free') }}</option>
            <option value="hybrid">{{ t('setup_room.cooling_hybrid') }}</option>
          </select>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mt-2 text-primary-dark text-sm"
      >
        <Info :size="18" class="flex-shrink-0" />
        <span v-html="t('setup_room.default_info')" />
      </div>

      <div v-if="error" class="text-danger text-sm text-center mt-4">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="setupStore.isLoading"
        class="mt-6 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95 disabled:opacity-60"
      >
        <Building2 :size="20" />
        {{ t('setup_room.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, MapPin, Server, Wind, Info } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { SetupStep } from '../../types';
import { roomApi } from '@/features/rooms/api';

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

const handleSubmit = async () => {
  try {
    setupStore.isLoading = true;
    error.value = null;

    const createdRoom = await roomApi.createRoom({
      name: form.name,
      //location: form.location,
      //capacity: form.capacity,
      //coolingType: form.coolingType,
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
    console.error('Error creating room:', e);
    error.value = e.response?.data?.message || t('setup_room.error');
    toast.error(error.value ?? t('setup_room.error'));
  } finally {
    setupStore.isLoading = false;
  }
};
</script>
