<script setup lang="ts">
import type { Release } from '../types';
import ReleaseCard from './ReleaseCard.vue';
defineProps<{ releases: Release[] }>();
</script>

<template>
  <div class="flex flex-col gap-3 p-2">
    <ReleaseCard v-for="rel in releases" :key="rel.tagName" :release="rel" />
    <div
      v-if="!releases.length"
      class="text-neutral-400 dark:text-neutral-500 text-center pt-12"
    >
      No releases found.
    </div>
  </div>
</template>
