<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import type { User, UserUpdateDto } from '../types';
import type { Role } from '@/features/roles/types';
import { onClickOutside } from '@vueuse/core';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import { useI18n } from 'vue-i18n';

import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  user: User | null;
  roles: Role[];
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'submit', 'update:user']);
const { t } = useI18n();

const localUser = computed({
  get: () => ({ ...props.user }),
  set: (val) => emit('update:user', val),
});

const selectedRoleId = computed({
  get: () => localUser.value?.roles?.[0]?.id || '',
  set: (roleId: string) => {
    if (localUser.value && roleId) {
      const selectedRole = props.roles.find((role) => role.id === roleId);
      if (selectedRole) {
        localUser.value.roles = [selectedRole];
      }
    }
  },
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser) Object.assign(localUser.value, newUser);
  },
);

const submitForm = () => {
  const updatePayload: UserUpdateDto = {
    username: localUser.value.username,
    firstName: localUser.value.firstName,
    lastName: localUser.value.lastName,
    email: localUser.value.email,
    roleIds: localUser.value.roles?.map((role) => role.id) || [],
  };
  emit('submit', updatePayload);
};

const modalRef = ref<HTMLElement | null>(null);
onClickOutside(modalRef, () => emit('close'));
</script>

<template>
  <transition name="slide">
    <div
      v-if="isOpen && user"
      class="fixed inset-0 z-50 flex justify-end bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20"
    >
      <div
        ref="modalRef"
        class="w-full max-w-md h-full bg-white dark:bg-neutral-800 p-6 overflow-y-auto shadow-2xl relative border-l border-neutral-200 dark:border-neutral-700"
      >
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-neutral-400 dark:text-neutral-500 hover:text-neutral-darker dark:hover:text-white"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-4 mb-6">
          <UserAvatar :user="user" size="md" pulse />

          <div>
            <h2
              class="text-lg font-semibold text-neutral-darker dark:text-white leading-tight"
            >
              {{ user?.username }}
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ user?.email }}
            </p>
            <p class="text-xs text-neutral-400 dark:text-neutral-500">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-neutral-darker dark:text-white mb-1 flex items-center gap-1"
            >
              <UserIcon class="w-4 h-4" /> {{ t('profile.username') }}
            </label>
            <input
              v-model="localUser.username"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-darker dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-neutral-darker dark:text-white mb-1 flex items-center gap-1"
              >
                <IdentificationIcon class="w-4 h-4" />
                {{ t('auth.form.firstname') }}
              </label>
              <input
                v-model="localUser.firstName"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-darker dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-neutral-darker dark:text-white mb-1 flex items-center gap-1"
              >
                <IdentificationIcon class="w-4 h-4" />
                {{ t('auth.form.lastname') }}
              </label>
              <input
                v-model="localUser.lastName"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-darker dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-neutral-darker dark:text-white mb-1 flex items-center gap-1"
            >
              <EnvelopeIcon class="w-4 h-4" /> {{ t('profile.email') }}
            </label>
            <input
              v-model="localUser.email"
              type="email"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-darker dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div v-if="roles.length > 0">
            <label
              class="block text-sm font-medium text-neutral-darker dark:text-white mb-1 flex items-center gap-1"
            >
              <ShieldCheckIcon class="w-4 h-4" />
              {{ t('users.form.role_label') }}
            </label>
            <select
              v-model="selectedRoleId"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-darker dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{{ t('users.form.select_role') }}</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-dark dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {{ t('profile.cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-primary dark:bg-blue-600 text-white hover:bg-primary-dark dark:hover:bg-blue-700"
            >
              {{ t('profile.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
