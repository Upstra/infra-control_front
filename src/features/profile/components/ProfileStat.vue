<template>
  <div class="bg-surface-sunken rounded-xl p-4">
    <dt class="text-sm font-medium text-text-muted">
      {{ label }}
    </dt>
    <dd class="mt-1 text-2xl font-semibold text-text-strong">
      {{ value }}
    </dd>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
}

defineProps<Props>();
</script>
