<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import type { Release } from '../types';

const props = defineProps<{ release: Release }>();
const md = new MarkdownIt();
const rendered = computed(() => md.render(props.release.body));
</script>

<template>
  <div
    class="transition shadow-sm hover:shadow-md border border-slate-200 dark:border-neutral-700 rounded-xl p-4 bg-white dark:bg-neutral-800 flex flex-col gap-1"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ release.name }}
      </h3>
      <span
        class="text-xs text-neutral-dark dark:text-neutral-400 opacity-70 whitespace-nowrap"
      >
        {{ new Date(release.publishedAt).toLocaleDateString() }}
        <template v-if="release.author"> — {{ release.author }}</template>
      </span>
    </div>
    <div
      v-html="rendered"
      class="prose prose-sm dark:prose-invert max-w-none text-sm mt-1"
    ></div>
    <a
      :href="release.htmlUrl"
      target="_blank"
      rel="noopener"
      class="mt-2 text-primary dark:text-blue-400 hover:underline text-sm self-end"
      >View on GitHub</a
    >
  </div>
</template>
