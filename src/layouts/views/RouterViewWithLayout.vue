<script setup lang="ts">
import { useRoute } from 'vue-router';
import DefaultLayout from './DefaultLayout.vue';
import { computed } from 'vue';

const route = useRoute();

const layoutComponent = computed(() => {
  return route.meta.layout === 'default' ? DefaultLayout : 'div';
});
</script>

<template>
  <component :is="layoutComponent">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </component>
</template>

<style scoped>
@media (max-width: 640px) {
  nav ul {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
