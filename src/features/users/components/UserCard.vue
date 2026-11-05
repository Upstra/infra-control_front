<template>
  <div
    class="bg-surface shadow rounded-xl p-6 hover:shadow-lg transition group flex flex-col items-center text-center border border-border"
    @click="onEdit"
  >
    <UserAvatar :user="user" size="lg" :pulse="user.isActive" class="mb-4" />

    <div class="text-lg font-semibold text-text-strong">
      {{ user.firstName }} {{ user.lastName }}
    </div>
    <div class="text-sm text-text-muted">
      {{ user.username }}
    </div>
    <div class="text-xs text-text-muted mb-2">
      {{ user.email }}
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
      <span
        v-for="role in user.roles"
        :key="role.id"
        :class="[
          'px-2 py-1 rounded-full text-xs font-medium',
          role.isAdmin
            ? 'bg-danger-surface text-danger-text'
            : 'bg-primary text-white',
        ]"
      >
        {{ role.name }}
      </span>
      <span
        v-if="!user.roles || user.roles.length === 0"
        class="px-2 py-1 rounded-full text-xs font-medium bg-surface-raised text-text-strong"
      >
        {{ $t('roles.no_role') }}
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
import type { User } from '../types';
import { PencilIcon } from '@heroicons/vue/24/solid';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits(['edit']);

const { t } = useI18n();
const onEdit = () => emit('edit', props.user);
</script>
