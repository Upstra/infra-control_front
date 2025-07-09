<script setup lang="ts">
import type { User } from '../types';
import type { Role } from '@/features/roles/types';
import { PencilIcon, ClipboardIcon } from '@heroicons/vue/24/solid';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import UserRolesDisplay from '@/shared/components/UserRolesDisplay.vue';
import { useI18n } from 'vue-i18n';

const { users, copiedEmail } = defineProps<{
  users: User[];
  roles: Role[];
  copiedEmail: string | null;
}>();

const emit = defineEmits<{
  (e: 'copyEmail', email: string): void;
  (e: 'edit', user: User): void;
}>();
const { t } = useI18n();
</script>

<template>
  <div
    class="w-full rounded-xl overflow-hidden shadow ring-1 ring-neutral-200 dark:ring-neutral-700 bg-white dark:bg-neutral-800"
  >
    <table class="w-full text-sm text-neutral-darker dark:text-neutral-300">
      <thead
        class="bg-neutral-light dark:bg-neutral-700 uppercase text-xs tracking-wider"
      >
        <tr>
          <th class="p-4 text-left">{{ t('users.headers.user') }}</th>
          <th class="p-4 text-left">{{ t('users.headers.email') }}</th>
          <th class="p-4 text-left">{{ t('users.headers.role') }}</th>
          <th class="p-4 text-center">{{ t('users.headers.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer"
        >
          <td class="p-4">
            <div class="flex items-center gap-3">
              <UserAvatar :user="user" size="md" :pulse="user.isActive" />

              <div class="leading-tight">
                <p class="font-semibold text-neutral-darker dark:text-white">
                  {{ user.firstName }} {{ user.lastName }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  @{{ user.username }}
                </p>
              </div>
            </div>
          </td>

          <td class="p-4 relative" @click="emit('copyEmail', user.email)">
            <span class="hover:underline">{{ user.email }}</span>
            <transition name="fade">
              <span
                v-if="copiedEmail === user.email"
                class="absolute top-0 left-0 w-full h-full bg-black dark:bg-white bg-opacity-70 dark:bg-opacity-90 text-white dark:text-black text-xs flex items-center justify-center rounded"
              >
                <ClipboardIcon class="w-4 h-4 mr-1" />
                {{ t('users.copy_success') }}
              </span>
            </transition>
          </td>

          <td class="p-4">
            <UserRolesDisplay :user="user" :max-visible-roles="3" />
          </td>

          <td class="p-4 text-center">
            <button
              @click="emit('edit', user)"
              class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-primary dark:border-blue-400 text-primary dark:text-blue-400 rounded hover:bg-primary dark:hover:bg-blue-400 hover:text-white dark:hover:text-black transition"
            >
              <PencilIcon class="w-4 h-4" /> {{ t('users.edit_user') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
