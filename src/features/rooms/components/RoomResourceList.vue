<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  title: string;
  empty: string;
  items: { id: string; name: string; meta: string; to: string }[];
}>();
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-sm"
  >
    <h2 class="m-0 flex items-center gap-2 text-card-title text-text-strong">
      <component
        :is="icon"
        class="h-4 w-4 text-primary-text"
        aria-hidden="true"
      />
      {{ title }}
      <span class="font-mono text-overline text-text-muted tnum">{{
        items.length
      }}</span>
    </h2>
    <ul v-if="items.length" class="m-0 flex list-none flex-col p-0">
      <li
        v-for="item in items"
        :key="item.id"
        class="border-t border-surface-raised first:border-0"
      >
        <router-link
          :to="item.to"
          class="flex items-center justify-between gap-3 py-2.5 hover:text-primary-text"
        >
          <span class="font-mono text-text-strong">{{ item.name }}</span>
          <span class="font-mono text-caption text-text-muted">{{
            item.meta
          }}</span>
        </router-link>
      </li>
    </ul>
    <p v-else class="m-0 text-text-muted">{{ empty }}</p>
  </section>
</template>
