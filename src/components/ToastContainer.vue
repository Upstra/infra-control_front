<script setup lang="ts">
import { useToast } from '@/shared/composables/useToast';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';

const { toasts, removeToast } = useToast();

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return XCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    default:
      return InformationCircleIcon;
  }
};

const getClasses = (type: string) => {
  const base = 'rounded-lg shadow-lg p-4 flex items-start gap-3 relative';
  switch (type) {
    case 'success':
      return `${base} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300`;
    case 'error':
      return `${base} bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300`;
    case 'warning':
      return `${base} bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300`;
    default:
      return `${base} bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300`;
  }
};
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="getClasses(toast.type)"
      >
        <component :is="getIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
        <p class="text-sm">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="absolute top-4 right-4 opacity-70 hover:opacity-100"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
