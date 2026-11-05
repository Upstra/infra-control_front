<template>
  <Modal :open="open" @close="emit('cancel')">
    <template #header>
      {{ title }}
    </template>

    <div class="mt-2">
      <p class="text-body text-text-muted">
        {{ message }}
      </p>
    </div>

    <template #footer>
      <button
        @click="emit('cancel')"
        class="pulse-press h-10 px-4 text-body font-medium text-text bg-transparent border border-border-control rounded-md hover:bg-surface-raised"
      >
        {{ cancelText }}
      </button>
      <button
        @click="emit('confirm')"
        :class="
          confirmButtonClass || [
            'pulse-press h-10 px-4 text-body font-medium text-on-primary rounded-md',
            variant === 'danger'
              ? 'bg-danger-solid hover:bg-danger'
              : 'bg-primary hover:bg-primary-hover',
          ]
        "
      >
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';

defineProps<{
  open?: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmButtonClass?: string;
  variant?: 'danger' | 'primary';
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>
