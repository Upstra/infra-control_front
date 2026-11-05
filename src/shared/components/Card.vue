<script setup lang="ts">
withDefaults(defineProps<{ critical?: boolean }>(), { critical: false });
</script>

<template>
  <div
    :class="[
      'rounded-lg border bg-surface shadow-sm transition-colors duration-[120ms]',
      critical
        ? 'border-danger-border shadow-glow-danger'
        : 'border-border hover:border-border-strong',
    ]"
  >
    <slot />
  </div>
</template>
