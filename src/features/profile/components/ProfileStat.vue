<template>
  <div class="bg-gray-50 dark:bg-neutral-700/50 rounded-xl p-4">
    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
      {{ label }}
    </dt>
    <dd class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
      {{ value }}
    </dd>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
}

defineProps<Props>();
</script>
