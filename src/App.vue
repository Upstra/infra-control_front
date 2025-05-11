<script setup lang="ts">
import DefaultLayout from "./layouts/views/DefaultLayout.vue"
import { useAuthStore } from "@/features/auth/store"
import { computed } from "vue"

const auth = useAuthStore()

const isLoggedIn = computed(() => auth.token !== null)
</script>

<template>
  <component :is="isLoggedIn ? DefaultLayout : 'div'">
    <router-view />
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
