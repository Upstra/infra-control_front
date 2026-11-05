<template>
  <div
    v-if="message"
    role="alert"
    class="mt-4 flex gap-3 rounded-md border border-danger-border bg-danger-surface p-4 text-danger-text"
  >
    <TriangleAlert class="h-5 w-5 flex-none" aria-hidden="true" />
    <p class="text-body">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next';

defineProps<{ message?: string }>();
</script>
