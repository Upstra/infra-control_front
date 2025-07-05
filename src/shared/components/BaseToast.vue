<template>
  <transition name="fade" mode="out-in">
    <div
      v-if="visible"
      class="fixed top-5 right-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg px-4 py-3 min-w-[240px] z-50 flex items-center space-x-3 animate-fade-in"
    >
      <div
        :class="[
          'w-2 h-2 rounded-full',
          type === 'success'
            ? 'bg-green-500'
            : type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500',
        ]"
      />
      <span
        class="text-sm text-neutral-700 dark:text-neutral-300 font-medium"
        >{{ message }}</span
      >
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
