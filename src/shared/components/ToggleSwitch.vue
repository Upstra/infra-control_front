<template>
  <button
    @click="$emit('update:modelValue', !modelValue)"
    :class="[
      'relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
      modelValue ? 'bg-primary' : 'bg-toggle-off',
    ]"
    :disabled="disabled"
    type="button"
    role="switch"
    :aria-checked="modelValue"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm transition-transform duration-200 ease-in-out',
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
