<script setup lang="ts">
const props = defineProps<{ count: number }>();
</script>

<template>
  <div class="flex flex-col gap-3 p-2">
    <div
      v-for="i in props.count"
      :key="i"
      class="animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl h-28"
    />
  </div>
</template>
