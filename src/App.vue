<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// Filtrer uniquement les routes dont le path est défini et qui ne sont pas des routes paramétrées
const links = computed(() =>
  router.getRoutes().filter(
    (route) => route.path && !route.path.includes(':') && route.path !== '*'
  )
)
</script>

<template>
  <div id="app">
    <nav class="p-4 bg-gray-100">
      <ul class="flex gap-4">
        <li v-for="link in links" :key="link.path">
          <router-link
            :to="link.path"
            class="text-blue-600 hover:underline"
          >{{ link.path }}</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
/* Tu peux ajouter ici des styles supplémentaires pour la nav */
</style>