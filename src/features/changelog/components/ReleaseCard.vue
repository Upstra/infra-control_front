<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import type { Release } from '../types';

const props = defineProps<{ release: Release }>();

const md = new MarkdownIt();
const rendered = computed(() => md.render(props.release.body));
</script>

<template>
  <div class="bg-white border rounded-xl shadow p-4 space-y-2">
    <h3 class="text-lg font-semibold">{{ release.name }}</h3>
    <p class="text-sm text-neutral-dark">
      {{ new Date(release.publishedAt).toLocaleDateString() }}
      <span v-if="release.author"> — {{ release.author }}</span>
    </p>
    <div v-html="rendered" class="prose max-w-none text-sm"></div>
    <a
      :href="release.htmlUrl"
      target="_blank"
      class="text-primary hover:underline text-sm block"
    >
      View on GitHub
    </a>
  </div>
</template>
