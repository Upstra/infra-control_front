<template>
  <div class="relative my-6">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-200 dark:border-gray-600"></div>
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-4 bg-white dark:bg-neutral-800 text-gray-500 dark:text-gray-400 font-medium">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>
