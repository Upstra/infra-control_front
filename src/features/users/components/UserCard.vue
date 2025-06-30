<template>
  <div
    class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition group flex flex-col items-center text-center border border-neutral-200"
    @click="onEdit"
  >
    <UserAvatar :user="user" size="lg" pulse class="mb-4" />

    <div class="text-lg font-semibold text-neutral-darker">
      {{ user.firstName }} {{ user.lastName }}
    </div>
    <div class="text-sm text-neutral-500">{{ user.username }}</div>
    <div class="text-xs text-neutral-400 mb-2">{{ user.email }}</div>

    <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
      <span
        class="px-2 py-1 rounded-full text-xs font-medium text-white"
        :class="
          user.roleId === 'admin-role-id'
            ? 'bg-blue-600'
            : user.roleId === 'tech-role-id'
              ? 'bg-green-600'
              : 'bg-gray-600'
        "
      >
        {{ roles.find((r) => r.id === user.roleId)?.name }}
      </span>
    </div>

    <button
      class="mt-4 px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition flex items-center gap-1"
    >
      <PencilIcon class="w-4 h-4" aria-hidden="true" />
      {{ t('users.edit_user') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '@/features/roles/types';
import type { User } from '../types';
import { PencilIcon } from '@heroicons/vue/24/solid';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  user: User;
  roles: Role[];
}>();

const emit = defineEmits(['edit']);

const { t } = useI18n();
const onEdit = () => emit('edit', props.user);
</script>
