<script setup lang="ts">
defineProps<{
  title: string;
  value: number | string;
  icon?: string;
  color?: 'primary' | 'blue' | 'red' | 'green';
}>();
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-center gap-4"
  >
    <div
      :class="[
        'rounded-full p-2 text-white',
        color === 'primary'
          ? 'bg-primary'
          : color === 'blue'
            ? 'bg-blue-500'
            : color === 'red'
              ? 'bg-red-500'
              : 'bg-green-500',
      ]"
    >
      <i :class="`lucide lucide-${icon || 'activity'}`"></i>
    </div>
    <div>
      <p class="text-sm text-neutral-dark dark:text-neutral-400">{{ title }}</p>
      <p class="text-2xl font-bold text-neutral-darker dark:text-white">{{ value }}</p>
    </div>
  </div>
</template>

<style scoped>
@import 'https://unpkg.com/lucide-static@0.268.0/icons.css';
</style>
