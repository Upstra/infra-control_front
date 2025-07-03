<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '@/features/users/types';
import type { Role } from '@/features/roles/types';
import { EllipsisHorizontalIcon } from '@heroicons/vue/24/solid';
import { useI18n } from 'vue-i18n';

interface Props {
  user: User;
  maxVisibleRoles?: number;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleRoles: 3,
  size: 'md',
});

const { t } = useI18n();
const showModal = ref(false);

const getUserRoles = (): Role[] => {
  if (!props.user.roles || props.user.roles.length === 0) return [];
  return props.user.roles;
};

const getRoleBadgeClass = (role: Role) => {
  const baseClasses = role.isAdmin
    ? 'bg-primary dark:bg-blue-600 text-white'
    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300';

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1',
  };

  return `${baseClasses} ${sizeClasses[props.size]}`;
};

const getMoreButtonClass = () => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1',
  };

  return `inline-flex items-center font-medium rounded-full bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-400 dark:hover:bg-neutral-500 transition-colors ${sizeClasses[props.size]}`;
};

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<template>
  <div class="flex items-center gap-1 flex-wrap">
    <template v-if="getUserRoles().length === 0">
      <span
        class="inline-block font-medium rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
        :class="getRoleBadgeClass({ name: '', isAdmin: false, id: '' })"
      >
        {{ t('users.no_roles') }}
      </span>
    </template>

    <template v-else-if="getUserRoles().length <= maxVisibleRoles">
      <span
        v-for="role in getUserRoles()"
        :key="role.id"
        class="inline-block font-medium rounded-full"
        :class="getRoleBadgeClass(role)"
      >
        {{ role.name }}
      </span>
    </template>

    <template v-else>
      <span
        v-for="role in getUserRoles().slice(0, maxVisibleRoles - 1)"
        :key="role.id"
        class="inline-block font-medium rounded-full"
        :class="getRoleBadgeClass(role)"
      >
        {{ role.name }}
      </span>
      <button
        @click="openModal"
        :class="getMoreButtonClass()"
        :title="`+${getUserRoles().length - (maxVisibleRoles - 1)} ${t('users.more_roles')}`"
      >
        <EllipsisHorizontalIcon class="w-3 h-3 mr-1" />
        +{{ getUserRoles().length - (maxVisibleRoles - 1) }}
      </button>
    </template>
  </div>

  <!-- Roles Modal -->
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-neutral-800 dark:text-white">
          {{
            t('users.user_roles', {
              user: `${user.firstName} ${user.lastName}`,
            })
          }}
        </h3>
        <button
          @click="closeModal"
          class="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="role in getUserRoles()"
          :key="role.id"
          class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
        >
          <div>
            <span
              class="inline-block text-sm font-medium px-3 py-1 rounded-full"
              :class="getRoleBadgeClass(role)"
            >
              {{ role.name }}
            </span>
          </div>
          <div v-if="role.isAdmin" class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('users.admin_role') }}
          </div>
        </div>
      </div>

      <div
        v-if="getUserRoles().length === 0"
        class="text-center py-4 text-neutral-500 dark:text-neutral-400"
      >
        {{ t('users.no_roles_assigned') }}
      </div>
    </div>
  </div>
</template>
