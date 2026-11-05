<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-text mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-danger-text ml-1">*</span>
    </label>
    <div class="relative">
      <input
        ref="inputRef"
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
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'placeholder:text-text-faint',
          error
            ? 'border-danger-border bg-danger-surface focus:ring-danger'
            : 'border-border-control bg-surface hover:border-border-control',
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
    <p
      v-if="error"
      class="mt-2 text-sm text-danger-text"
    >
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-2 text-sm text-text-muted">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, ref } from 'vue';

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

const inputRef = ref<HTMLInputElement>();

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

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({
  focus,
});
</script>
