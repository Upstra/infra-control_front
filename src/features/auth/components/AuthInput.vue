<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1 dark:text-red-400">*</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @keyup.enter="$emit('enter')"
        @paste="onPaste"
        @copy="onCopy"
        :class="[
          'w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-300',
          error
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 hover:border-gray-400 dark:hover:border-gray-500 dark:text-white',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          hasIcon ? 'pr-12' : '',
        ]"
      />
      <div
        v-if="hasIcon"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <slot name="icon" />
      </div>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400 dark:bg-red-900/20">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-2 text-sm text-gray-500 dark:text-gray-200">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'enter'): void;
}>();

const props = defineProps<{
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  modelValue: string;
  error?: string;
  hint?: string;
  preventPaste?: boolean;
  preventCopy?: boolean;
}>();

const slots = useSlots();
const hasIcon = computed(() => !!slots.icon);

const onPaste = (e: ClipboardEvent) => {
  if (props.preventPaste) {
    e.preventDefault();
  }
};

const onCopy = (e: ClipboardEvent) => {
  if (props.preventCopy) {
    e.preventDefault();
  }
};
</script>
