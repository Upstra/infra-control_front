<script setup lang="ts" generic="T extends string">
import type { SegmentOption } from './types';

defineProps<{
  options: SegmentOption<T>[];
  modelValue: T;
  label: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: T] }>();
</script>

<template>
  <div
    role="group"
    :aria-label="label"
    class="inline-flex gap-1 rounded-full border border-border bg-surface-sunken p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="option.value === modelValue"
      :class="[
        'pulse-press inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-caption',
        option.value === modelValue
          ? 'bg-border font-medium text-text-strong'
          : 'text-text-muted hover:text-text',
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
