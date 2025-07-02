<template>
  <div
    v-if="message"
    class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

defineProps<{ message?: string }>();
</script>
