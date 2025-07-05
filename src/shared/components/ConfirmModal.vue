<template>
  <Modal @close="emit('cancel')">
    <template #header>
      {{ title }}
    </template>

    <div class="mt-2">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
    </div>

    <template #footer>
      <button
        @click="emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        {{ cancelText }}
      </button>
      <button
        @click="emit('confirm')"
        :class="[
          'px-4 py-2 text-sm font-medium text-white rounded-md',
          variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
            : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
        ]"
      >
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';

defineProps<{
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: 'danger' | 'primary';
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>
