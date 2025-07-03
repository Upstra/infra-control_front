<script setup lang="ts">
import type { User } from '@/features/users/types';
import { PencilIcon } from '@heroicons/vue/24/solid';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import { usePresenceStore } from '@/features/presence/store';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ user: User | null }>();
const emit = defineEmits(['edit']);

const presenceStore = usePresenceStore();
const { t } = useI18n();
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center gap-6 bg-white dark:bg-neutral-800 shadow p-6 rounded-xl border border-neutral-200 dark:border-neutral-700"
  >
    <div class="relative w-fit">
      <UserAvatar v-if="props.user" :user="props.user" size="lg" pulse />
      <span
        v-if="props.user"
        class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800"
        :class="{
          'bg-success': presenceStore.statuses[props.user.id],
          'bg-neutral-300': !presenceStore.statuses[props.user.id],
        }"
      />
    </div>

    <div class="flex-1 space-y-1">
      <h1 class="text-2xl font-semibold text-neutral-darker dark:text-white">
        {{ props.user?.firstName }} {{ props.user?.lastName }}
      </h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ props.user?.email }}</p>

      <div class="flex items-center gap-2 pt-2">
        <span
          v-if="props.user"
          class="inline-block text-xs font-medium px-2 py-1 rounded-full"
          :class="{
            'bg-success text-white': presenceStore.statuses[props.user.id],
            'bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300':
              !presenceStore.statuses[props.user.id],
          }"
        >
          {{
            presenceStore.statuses[props.user.id]
              ? t('servers.online')
              : t('servers.offline')
          }}
        </span>
      </div>
    </div>

    <button
      @click="emit('edit')"
      class="px-4 py-2 text-sm border border-primary dark:border-blue-400 text-primary dark:text-blue-400 rounded hover:bg-primary dark:hover:bg-blue-400 hover:text-white dark:hover:text-black transition flex items-center gap-1"
    >
      <PencilIcon class="w-4 h-4" /> {{ t('users.edit_user') }}
    </button>
  </div>
</template>
