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
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 px-4 py-6 sm:px-0"
    >
      <div
        ref="modalRef"
        class="relative bg-surface w-full max-w-sm sm:rounded-xl shadow-2xl border border-border p-6"
      >
        <button
          @click="handleClose"
          class="absolute top-3 right-3 text-text-muted hover:text-text-strong transition"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-4 mb-6">
          <UserAvatar v-if="user" :user="user" size="md" pulse />

          <div>
            <h2
              class="text-lg font-semibold text-text-strong leading-tight"
            >
              {{ user?.username }}
            </h2>
            <p class="text-sm text-text-muted">
              {{ user?.email }}
            </p>
            <p class="text-xs text-text-muted">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="handleEditUser"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-surface-raised hover:bg-primary/10 text-text-strong hover:text-primary transition"
          >
            <PencilIcon class="w-5 h-5" />
            {{ t('users.edit_user') }}
          </button>

          <button
            @click="handleEditRole"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-surface-raised hover:bg-[rgb(var(--c-primary-hover)/0.1)] text-text-strong hover:text-primary-text transition"
          >
            <ShieldCheckIcon class="w-5 h-5" />
            {{ t('users.edit_role') }}
          </button>

          <button
            @click="handleToggleStatus"
            :disabled="user?.roles?.some((role) => role.isAdmin)"
            :class="[
              'flex items-center gap-3 w-full px-4 py-2 rounded-lg transition',
              user?.roles?.some((role) => role.isAdmin)
                ? 'bg-surface-raised text-text-muted cursor-not-allowed opacity-60'
                : 'bg-surface-raised hover:bg-warning-surface text-text-strong hover:text-warning-text',
            ]"
          >
            <ArrowPathIcon class="w-5 h-5" />
            <span>
              {{ user?.isActive ? t('users.deactivate') : t('users.activate') }}
              {{ t('users.headers.user') }}
              <span
                v-if="user?.roles?.some((role) => role.isAdmin)"
                class="text-xs"
              >
                ({{ t('users.admin_cannot_be_deactivated') }})
              </span>
            </span>
          </button>

          <button
            @click="handleResetPassword"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-surface-raised hover:bg-purple-50 text-text-strong hover:text-purple-600 transition"
          >
            <LockClosedIcon class="w-5 h-5" />
            {{ t('users.reset_password') }}
          </button>

          <button
            @click="handleDeleteUser"
            :disabled="user?.roles?.some((role) => role.isAdmin)"
            :class="[
              'flex items-center gap-3 w-full px-4 py-2 rounded-lg border transition',
              user?.roles?.some((role) => role.isAdmin)
                ? 'bg-surface-raised text-text-muted border-border cursor-not-allowed opacity-60'
                : 'bg-danger-surface text-danger-text hover:bg-danger-surface border-danger-border',
            ]"
          >
            <TrashIcon class="w-5 h-5" />
            <span>
              {{ t('users.delete_user') }}
              <span
                v-if="user?.roles?.some((role) => role.isAdmin)"
                class="text-xs"
              >
                ({{ t('users.admin_cannot_be_deleted') }})
              </span>
            </span>
          </button>

          <button
            @click="handleClose"
            class="w-full px-4 py-2 rounded-lg border border-border-control text-text hover:bg-surface-raised transition"
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
