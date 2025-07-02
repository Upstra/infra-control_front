<script setup lang="ts">
import type { User } from '../types';
import type { Role } from '@/features/roles/types';
import {
  PencilIcon,
  ClipboardIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/vue/24/solid';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

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

const modalUser = ref<User | null>(null);

const getUserRoles = (user: User): Role[] => {
  if (!user.roles || user.roles.length === 0) return [];
  return user.roles;
};

const getRoleBadgeClass = (role: Role) => {
  return role.isAdmin
    ? 'bg-primary text-white'
    : 'bg-neutral-200 text-neutral-700';
};

const showRolesModal = (user: User) => {
  modalUser.value = user;
};

const closeRolesModal = () => {
  modalUser.value = null;
};
</script>

<template>
  <div
    class="w-full rounded-xl overflow-hidden shadow ring-1 ring-neutral-200 bg-white"
  >
    <table class="w-full text-sm text-neutral-darker">
      <thead class="bg-neutral-light uppercase text-xs tracking-wider">
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
          class="border-t border-neutral-200 hover:bg-neutral-100 transition cursor-pointer"
        >
          <td class="p-4">
            <div class="flex items-center gap-3">
              <UserAvatar :user="user" size="md" pulse />

              <div class="leading-tight">
                <p class="font-semibold">
                  {{ user.firstName }} {{ user.lastName }}
                </p>
                <p class="text-xs text-neutral-500">{{ user.username }}</p>
              </div>
            </div>
          </td>

          <td class="p-4 relative" @click="emit('copyEmail', user.email)">
            <span class="hover:underline">{{ user.email }}</span>
            <transition name="fade">
              <span
                v-if="copiedEmail === user.email"
                class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 text-white text-xs flex items-center justify-center rounded"
              >
                <ClipboardIcon class="w-4 h-4 mr-1" />
                {{ t('users.copy_success') }}
              </span>
            </transition>
          </td>

          <td class="p-4">
            <div class="flex items-center gap-1 flex-wrap">
              <template v-if="getUserRoles(user).length === 0">
                <span
                  class="inline-block text-xs font-medium px-2 py-1 rounded-full bg-neutral-200 text-neutral-700"
                >
                  {{ t('users.no_roles') }}
                </span>
              </template>

              <template v-else-if="getUserRoles(user).length <= 3">
                <span
                  v-for="role in getUserRoles(user)"
                  :key="role.id"
                  class="inline-block text-xs font-medium px-2 py-1 rounded-full"
                  :class="getRoleBadgeClass(role)"
                >
                  {{ role.name }}
                </span>
              </template>

              <template v-else>
                <span
                  v-for="role in getUserRoles(user).slice(0, 2)"
                  :key="role.id"
                  class="inline-block text-xs font-medium px-2 py-1 rounded-full"
                  :class="getRoleBadgeClass(role)"
                >
                  {{ role.name }}
                </span>
                <button
                  @click="showRolesModal(user)"
                  class="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-neutral-300 text-neutral-700 hover:bg-neutral-400 transition-colors"
                  :title="`+${getUserRoles(user).length - 2} ${t('users.more_roles')}`"
                >
                  <EllipsisHorizontalIcon class="w-3 h-3 mr-1" />
                  +{{ getUserRoles(user).length - 2 }}
                </button>
              </template>
            </div>
          </td>

          <td class="p-4 text-center">
            <button
              @click="emit('edit', user)"
              class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-primary text-primary rounded hover:bg-primary hover:text-white transition"
            >
              <PencilIcon class="w-4 h-4" /> {{ t('users.edit_user') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Roles Modal -->
  <div
    v-if="modalUser"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeRolesModal"
  >
    <div
      class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-neutral-800">
          {{
            t('users.user_roles', {
              user: `${modalUser.firstName} ${modalUser.lastName}`,
            })
          }}
        </h3>
        <button
          @click="closeRolesModal"
          class="text-neutral-500 hover:text-neutral-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="role in getUserRoles(modalUser)"
          :key="role.id"
          class="flex items-center justify-between p-3 rounded-lg border border-neutral-200"
        >
          <div>
            <span
              class="inline-block text-sm font-medium px-3 py-1 rounded-full"
              :class="getRoleBadgeClass(role)"
            >
              {{ role.name }}
            </span>
          </div>
          <div v-if="role.isAdmin" class="text-xs text-neutral-500">
            {{ t('users.admin_role') }}
          </div>
        </div>
      </div>

      <div
        v-if="getUserRoles(modalUser).length === 0"
        class="text-center py-4 text-neutral-500"
      >
        {{ t('users.no_roles_assigned') }}
      </div>
    </div>
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
