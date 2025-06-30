<script setup lang="ts">
import type { Release } from '../types';
import ReleaseCard from './ReleaseCard.vue';

defineProps<{ releases: Release[] }>();
</script>

<template>
  <div class="space-y-4">
    <ReleaseCard
      v-for="rel in releases"
      :key="rel.tagName"
      :release="rel"
    />
  </div>
</template>
