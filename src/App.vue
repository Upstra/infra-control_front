<script setup lang="ts">
import DefaultLayout from "./layouts/DefaultLayout.vue";
</script>

<template>
  <default-layout><router-view /></default-layout>
</template>

<style scoped>
@media (max-width: 640px) {
  nav ul {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
