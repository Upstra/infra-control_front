<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '../types';
import type { Role } from '@/features/roles/types';
import { onClickOutside } from '@vueuse/core';
import {
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  user: User | null;
  isOpen: boolean;
  roles: Role[];
}>();

const emit = defineEmits([
  'close',
  'editUser',
  'editRole',
  'deleteUser',
  'resetPassword',
  'toggleUserStatus',
]);

const modalRef = ref<HTMLElement | null>(null);
onClickOutside(modalRef, () => emit('close'));

const handleClose = () => emit('close');
const handleEditUser = () => emit('editUser', props.user);
const handleEditRole = () => emit('editRole', props.user);
const handleDeleteUser = () => emit('deleteUser', props.user);
const handleResetPassword = () => emit('resetPassword', props.user);
const handleToggleStatus = () => emit('toggleUserStatus', props.user);

const { t } = useI18n();
</script>

<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-50 px-4 py-6 sm:px-0"
    >
      <div
        ref="modalRef"
        class="relative bg-white dark:bg-neutral-800 w-full max-w-sm sm:rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-6"
      >
        <button
          @click="handleClose"
          class="absolute top-3 right-3 text-neutral-400 dark:text-neutral-500 hover:text-neutral-darker dark:hover:text-white transition"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-4 mb-6">
          <UserAvatar v-if="user" :user="user" size="md" pulse />

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

        <div class="space-y-3">
          <button
            @click="handleEditUser"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-primary/10 dark:hover:bg-primary/20 text-neutral-darker dark:text-white hover:text-primary dark:hover:text-blue-400 transition"
          >
            <PencilIcon class="w-5 h-5" />
            {{ t('users.edit_user') }}
          </button>

          <button
            @click="handleEditRole"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-darker dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ShieldCheckIcon class="w-5 h-5" />
            {{ t('users.edit_role') }}
          </button>

          <button
            @click="handleToggleStatus"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-neutral-darker dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition"
          >
            <ArrowPathIcon class="w-5 h-5" />
            {{ user?.active ? t('users.deactivate') : t('users.activate') }}
            {{ t('users.headers.user') }}
          </button>

          <button
            @click="handleResetPassword"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-neutral-darker dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            <LockClosedIcon class="w-5 h-5" />
            {{ t('users.reset_password') }}
          </button>

          <button
            v-if="!user?.roles?.some((role) => role.id === 'admin-role-id')"
            @click="handleDeleteUser"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
          >
            <TrashIcon class="w-5 h-5" />
            {{ t('users.delete_user') }}
          </button>

          <button
            @click="handleClose"
            class="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
          >
            {{ t('profile.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
