<template>
  <button
    @click="$emit('update:modelValue', !modelValue)"
    :class="[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-800',
      modelValue ? 'bg-primary' : 'bg-gray-200 dark:bg-neutral-700',
    ]"
    :disabled="disabled"
    type="button"
    role="switch"
    :aria-checked="modelValue"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm',
        modelValue ? 'translate-x-6' : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  disabled?: boolean;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
