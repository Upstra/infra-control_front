<template>
  <button
    @click="$emit('click')"
    :class="[
      'px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200',
      isActive
        ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-neutral-700'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
    ]"
  >
    <div class="flex items-center space-x-2">
      <component :is="icon" class="h-4 w-4" />
      <span>{{ label }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  label: string;
  icon: Component;
  isActive: boolean;
}

defineProps<Props>();

defineEmits<{
  click: [];
}>();
</script>
