<script setup lang="ts" generic="T extends string">
defineProps<{
  tabs: { value: T; label: string; count?: number | null }[];
  label: string;
}>();

const active = defineModel<T>({ required: true });
</script>

<template>
  <div
    role="tablist"
    :aria-label="label"
    class="flex gap-1 overflow-x-auto border-b border-surface-raised px-6 pt-4"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="active === tab.value"
      :class="[
        'inline-flex h-10 flex-none items-center gap-2 rounded-t-md px-3.5 font-medium transition-colors',
        active === tab.value
          ? 'text-text-strong shadow-[inset_0_-2px_0_0_rgb(var(--c-primary-hover))]'
          : 'text-text-muted hover:text-text-strong',
      ]"
      @click="active = tab.value"
    >
      {{ tab.label }}
      <span
        v-if="tab.count !== null && tab.count !== undefined"
        class="font-mono text-overline text-text-faint tnum"
        >{{ tab.count }}</span
      >
    </button>
  </div>
</template>
