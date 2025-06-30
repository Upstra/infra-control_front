<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div
        ref="modalRef"
        class="relative bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]"
      >
        <button
          class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-darker"
          @click="$emit('close')"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-bold text-neutral-darker mb-4">
          {{ t('servers.create_title') }}
        </h2>
        <form @submit.prevent="handleSubmit" class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.name') }}
                <input v-model="form.name" type="text" class="input" required />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.state') }}
                <select v-model="form.state" class="input">
                  <option value="active">{{ t('servers.active') }}</option>
                  <option value="inactive">{{ t('servers.inactive') }}</option>
                </select>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.ip') }}
                <input v-model="form.ip" type="text" class="input" required />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.admin_url') }}
                <input v-model="form.adminUrl" type="url" class="input" />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.login') }}
                <input v-model="form.login" type="text" class="input" />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.password') }}
                <input v-model="form.password" type="password" class="input" />
              </label>
            </div>

            <div>
              {{ t('servers.type') }}
              <label class="block text-sm font-medium">
                <select v-model="form.type" class="input">
                  <option value="physical">{{ t('servers.physical') }}</option>
                  <option value="virtual">{{ t('servers.virtual') }}</option>
                </select>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.priority') }}
                <input
                  v-model.number="form.priority"
                  type="number"
                  min="1"
                  class="input"
                />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.shutdown_delay') }} (s)
                <input
                  v-model.number="form.grace_period_off"
                  type="number"
                  min="0"
                  class="input"
                />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.startup_delay') }} (s)
                <input
                  v-model.number="form.grace_period_on"
                  type="number"
                  min="0"
                  class="input"
                />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                {{ t('servers.room') }}
                <select v-model="form.roomId" class="input" required>
                  <option value="" disabled>
                    {{ t('servers.select_room') }}
                  </option>
                  <option v-for="room in rooms" :key="room.id" :value="room.id">
                    {{ room.name }}
                  </option>
                </select>
                <div
                  v-if="selectedRoom"
                  class="mt-2 p-3 border rounded-lg bg-neutral-50 text-sm"
                >
                  <p>
                    <strong>{{ t('servers.selected_name') }}</strong>
                    {{ selectedRoom.name }}
                  </p>
                  <p>
                    <strong>{{ t('servers.selected_id') }}</strong>
                    {{ selectedRoom.id }}
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium">
                Groupe
                <input v-model="form.groupId" type="text" class="input" />
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium"
                >{{ t('servers.ups') }}
                <select v-model="form.upsId" class="input">
                  <option value="">{{ t('servers.none') }}</option>
                  <option v-for="ups in upsList" :key="ups.id" :value="ups.id">
                    {{ ups.name }}
                  </option>
                </select>
                <div
                  v-if="selectedUps"
                  class="mt-2 p-3 border rounded-lg bg-neutral-50 text-sm"
                >
                  <p>
                    <strong>{{ t('servers.selected_name') }}</strong>
                    {{ selectedUps.name }}
                  </p>
                  <p>
                    <strong>{{ t('servers.ip') }} :</strong>
                    {{ selectedUps.ip }}
                  </p>
                  <p>
                    <strong>{{ t('servers.startup_delay') }} :</strong>
                    {{ selectedUps.grace_period_on }}s
                  </p>
                  <p>
                    <strong>{{ t('servers.shutdown_delay') }} :</strong>
                    {{ selectedUps.grace_period_off }}s
                  </p>
                </div>
              </label>
            </div>
          </div>

          <fieldset class="border-t pt-4">
            <legend class="text-lg font-medium text-neutral-dark">
              {{ t('servers.ilo_section') }}
            </legend>

            <div class="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label class="block text-sm font-medium"
                  >{{ t('servers.ilo_name') }}
                  <input v-model="form.ilo.name" type="text" class="input" />
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium"
                  >{{ t('servers.ilo_ip') }}
                  <input v-model="form.ilo.ip" type="text" class="input" />
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium"
                  >{{ t('servers.ilo_login') }}
                  <input v-model="form.ilo.login" type="text" class="input" />
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium"
                  >{{ t('servers.ilo_password') }}
                  <input
                    v-model="form.ilo.password"
                    type="password"
                    class="input"
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <div class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              {{
                isSubmitting
                  ? t('servers.creating')
                  : t('servers.create_button')
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { createServer } from '../api';
import type { CreateServerPayload } from '../types';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import type { RoomResponseDto } from '@/features/rooms/types';
import type { UpsResponseDto } from '@/features/ups/types';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);
const { t } = useI18n();

const form = ref<CreateServerPayload>({
  name: '',
  state: 'active',
  grace_period_on: 10,
  grace_period_off: 10,
  adminUrl: '',
  ip: '',
  login: '',
  password: '',
  type: 'physical',
  priority: 1,
  roomId: '',
  //groupId: '',  // si il n'y a pas de groupid alors on l'enleve
  upsId: '',
  ilo: {
    name: '',
    ip: '',
    login: '',
    password: '',
  },
});

const rooms = ref<RoomResponseDto[]>([]);
const upsList = ref<UpsResponseDto[]>([]);
const selectedRoom = ref<RoomResponseDto | null>(null);
const selectedUps = ref<UpsResponseDto | null>(null);

const isSubmitting = ref(false);
const modalRef = ref<HTMLElement | null>(null);

onClickOutside(modalRef, () => emit('close'));

const loadOptions = async () => {
  try {
    rooms.value = await roomApi.fetchRooms();
  } catch {
    rooms.value = [];
  }
  try {
    upsList.value = await upsApi.getAll();
  } catch {
    upsList.value = [];
  }
};

watch(
  () => form.value.roomId,
  async (id) => {
    if (!id) {
      selectedRoom.value = null;
      return;
    }
    try {
      selectedRoom.value = await roomApi.fetchRoomById(id);
    } catch {
      selectedRoom.value = null;
    }
  },
);

watch(
  () => form.value.upsId,
  async (id) => {
    if (!id) {
      selectedUps.value = null;
      return;
    }
    try {
      selectedUps.value = await upsApi.getById(id);
    } catch {
      selectedUps.value = null;
    }
  },
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) loadOptions();
  },
);

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await createServer(form.value);
    emit('created');
    emit('close');
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.input {
  @apply w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>
