<script setup lang="ts">
import type { User } from '@/features/users/types';
import { usePresenceStore } from '@/features/presence/store';

const props = defineProps<{
  user: User;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}>();

const presenceStore = usePresenceStore();

const initials = `${props.user.firstName?.[0] ?? ''}${
  props.user.lastName?.[0] ?? ''
}`.toUpperCase();

const sizeClass = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-lg',
}[props.size ?? 'md'];
</script>

<template>
  <div class="relative inline-block">
    <div
      :class="[
        sizeClass,
        'rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-md border border-white',
      ]"
    >
      {{ initials }}
    </div>
    <span
      v-if="pulse && user"
      class="absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-neutral-800"
      :class="[
        presenceStore.statuses[user.id] ? 'bg-green-400' : 'bg-gray-400',
        size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3',
      ]"
    />
  </div>
</template>
