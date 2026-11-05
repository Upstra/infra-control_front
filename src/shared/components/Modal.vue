<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="pulse-overlay fixed inset-0 bg-black/60 transition-opacity"
        aria-hidden="true"
        @click="emit('close')"
      ></div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        :class="[
          'inline-block align-bottom bg-surface-modal border border-border rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle',
          sizeClasses[size],
        ]"
      >
        <div
          v-if="$slots.header"
          class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
        >
          <h3
            id="modal-title"
            class="text-card-title text-text-strong"
          >
            <slot name="header"></slot>
          </h3>
        </div>

        <div class="px-4 pb-4 text-text sm:px-6">
          <slot></slot>
        </div>

        <div
          v-if="$slots.footer"
          class="bg-surface-sunken border-t border-border px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    open: false,
    size: 'md',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const sizeClasses = {
  sm: 'sm:max-w-sm sm:w-full',
  md: 'sm:max-w-[32rem] sm:w-full',
  lg: 'sm:max-w-[42rem] sm:w-full',
  xl: 'sm:max-w-[56rem] sm:w-full',
};
</script>
