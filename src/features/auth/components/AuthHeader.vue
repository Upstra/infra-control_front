<template>
  <div class="text-center mb-8">
    <div class="mb-4">
      <div
        class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4"
      >
        <component :is="icon" :size="32" class="text-white" />
      </div>
    </div>
    <h1
      class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
    >
      {{ title }}
    </h1>
    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {{ description }}
    </p>
    <div
      v-if="badge"
      class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-400 text-sm font-medium"
    >
      <Shield :size="16" />
      {{ badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Shield } from 'lucide-vue-next';

defineProps<{
  icon: any;
  title: string;
  description: string;
  badge?: string;
}>();
</script>
