<template>
  <transition name="fade" mode="out-in">
    <div
      v-if="visible"
      role="status"
      class="fixed right-5 top-5 z-50 flex min-w-[240px] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg"
    >
      <span :class="['h-2 w-2 flex-none rounded-full', dotClass[type]]" />
      <span class="text-body font-medium text-text">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}>();

const dotClass = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-primary-hover',
};
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
