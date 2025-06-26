<script setup lang="ts">
import type { User } from "@/features/users/types";
import { PencilIcon } from "@heroicons/vue/24/solid";
import UserAvatar from "@/features/users/components/UserAvatar.vue";
import { usePresenceStore } from "@/features/presence/store";
import { useI18n } from 'vue-i18n'

const props = defineProps<{ user: User | null }>();
const emit = defineEmits(["edit"]);

const presenceStore = usePresenceStore();
const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-6 bg-white shadow p-6 rounded-xl border border-neutral-200">

    <div class="relative w-fit">
      <UserAvatar v-if="props.user" :user="props.user" size="lg" pulse />
      <span v-if="props.user" class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" :class="{
        'bg-success': presenceStore.statuses[props.user.id],
        'bg-neutral-300': !presenceStore.statuses[props.user.id],
      }" />
    </div>

    <div class="flex-1 space-y-1">
      <h1 class="text-2xl font-semibold text-neutral-darker">
        {{ props.user?.firstName }} {{ props.user?.lastName }}
      </h1>
      <p class="text-sm text-neutral-500">{{ props.user?.email }}</p>

      <div class="flex items-center gap-2 pt-2">
        <span class="inline-block text-xs font-medium px-2 py-1 rounded-full bg-primary text-white">
          {{ props.user?.roleId }}
        </span>

        <span v-if="props.user" class="inline-block text-xs font-medium px-2 py-1 rounded-full" :class="{
          'bg-success text-white': presenceStore.statuses[props.user.id],
          'bg-neutral-300 text-neutral-700': !presenceStore.statuses[props.user.id],
        }">
          {{
            presenceStore.statuses[props.user.id] ? t('servers.online') : t('servers.offline')
          }}
        </span>
      </div>
    </div>

    <button @click="emit('edit')"
      class="px-4 py-2 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition flex items-center gap-1">
      <PencilIcon class="w-4 h-4" /> {{ t('users.edit_user') }}
    </button>
  </div>
</template>