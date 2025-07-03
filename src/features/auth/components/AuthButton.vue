<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'primary'
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500',
      disabled
        ? 'opacity-60 cursor-not-allowed'
        : 'transform hover:scale-[1.02]',
    ]"
  >
    <div
      v-if="loading"
      class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
    ></div>
    <component v-else-if="icon" :is="icon" :size="20" />
    <span>{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  text: string;
  icon?: any;
}>();
</script>
