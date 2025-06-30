<script setup lang="ts">
import type { User } from '@/features/users/types';

const props = defineProps<{
  user: User;
  size?: 'sm' | 'md' | 'lg';
}>();

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
  <div
    :class="[
      sizeClass,
      'rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-md border border-white',
    ]"
  >
    {{ initials }}
  </div>
</template>
