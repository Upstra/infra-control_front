<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    meta?: string | null;
    label?: string;
    flush?: boolean;
    critical?: boolean;
  }>(),
  {
    title: undefined,
    meta: null,
    label: undefined,
    flush: false,
    critical: false,
  },
);
</script>

<template>
  <section
    :aria-label="label ?? title"
    :class="[
      'flex min-w-0 flex-col overflow-hidden rounded-lg border bg-surface shadow-sm',
      critical ? 'border-danger-border shadow-glow-danger' : 'border-border',
      flush ? '' : 'gap-4 p-6',
    ]"
  >
    <header
      v-if="title || $slots.actions"
      :class="['flex flex-wrap items-center gap-3', flush ? 'px-6 py-5' : '']"
    >
      <h2 v-if="title" class="m-0 text-card-title text-text-strong">
        {{ title }}
      </h2>
      <span
        v-if="meta"
        class="font-mono text-overline uppercase text-text-muted tnum"
        >{{ meta }}</span
      >
      <div class="flex-1" />
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>
