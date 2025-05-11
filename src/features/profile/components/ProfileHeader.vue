<script setup lang="ts">
import type { User } from "@/features/users/types";
import { PencilIcon } from "@heroicons/vue/24/solid";
import UserAvatar from "@/features/users/components/UserAvatar.vue";

const props = defineProps<{ user: User | null }>();
const emit = defineEmits(["edit"]);
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center gap-6 bg-white shadow p-6 rounded-xl border border-neutral-200">
    <UserAvatar :user="props.user" size="lg" pulse />

    <div class="flex-1 space-y-1">
      <h1 class="text-2xl font-semibold text-neutral-darker">
        {{ props.user?.firstName }} {{ props.user?.lastName }}
      </h1>
      <p class="text-sm text-neutral-500">{{ props.user?.email }}</p>
      <div class="flex items-center gap-2 pt-2">
        <span
          class="inline-block text-xs font-medium px-2 py-1 rounded-full bg-primary text-white">
          {{ props.user?.roleId }}
        </span>
      </div>
    </div>
    <button
      @click="emit('edit')"
      class="px-4 py-2 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition flex items-center gap-1">
      <PencilIcon class="w-4 h-4" /> Éditer
    </button>
  </div>
</template>
