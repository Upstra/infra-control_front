<script setup lang="ts">
import type { User } from '@/features/users/types';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline';
import UserRolesDisplay from '@/shared/components/UserRolesDisplay.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ user: User | null }>();
const { t } = useI18n();
</script>

<template>
  <section
    class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
  >
    <h2 class="text-lg font-semibold text-neutral-darker dark:text-white mb-2">
      {{ t('profile.info_title') }}
    </h2>
    <dl class="grid grid-cols-1 gap-y-4 text-sm">
      <div class="flex items-center gap-3">
        <UserIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32 dark:text-neutral-300">{{ t('profile.username') }}</dt>
        <dd class="text-neutral-600 dark:text-neutral-400">{{ props.user?.username }}</dd>
      </div>
      <div class="flex items-center gap-3">
        <EnvelopeIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32 dark:text-neutral-300">{{ t('profile.email') }}</dt>
        <dd class="text-neutral-600 dark:text-neutral-400">{{ props.user?.email }}</dd>
      </div>
      <div class="flex items-center gap-3">
        <CalendarIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32 dark:text-neutral-300">{{ t('profile.created_at') }}</dt>
        <dd class="text-neutral-600 dark:text-neutral-400">
          {{ new Date(props.user?.createdAt ?? '').toLocaleDateString() }}
        </dd>
      </div>
      <div class="flex items-center gap-3">
        <CalendarIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32 dark:text-neutral-300">{{ t('profile.updated_at') }}</dt>
        <dd class="text-neutral-600 dark:text-neutral-400">
          {{ new Date(props.user?.updatedAt ?? '').toLocaleDateString() }}
        </dd>
      </div>
      <div class="flex items-center gap-3">
        <UserGroupIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32 dark:text-neutral-300">{{ t('profile.roles') }}</dt>
        <dd class="text-neutral-600 dark:text-neutral-400">
          <UserRolesDisplay
            v-if="props.user"
            :user="props.user"
            :max-visible-roles="2"
            size="sm"
          />
        </dd>
      </div>
    </dl>
  </section>
</template>
