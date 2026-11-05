<script setup lang="ts">
withDefaults(
  defineProps<{ label: string; hint?: string | null; error?: string | null; tag?: 'label' | 'div' }>(),
  { hint: null, error: null, tag: 'label' },
);
</script>

<template>
  <component :is="tag" class="flex flex-col gap-1.5">
    <span class="text-caption font-medium text-text">{{ label }}</span>
    <slot />
    <span v-if="error" class="text-caption text-danger-text" role="alert">{{ error }}</span>
    <span v-else-if="hint" class="text-caption text-text-muted">{{ hint }}</span>
  </component>
</template>
