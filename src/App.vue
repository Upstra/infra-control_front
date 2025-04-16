<script setup lang="ts">
import { useToaster } from '@/shared/composables/useToaster'
const { visible, message, type } = useToaster()

</script>

<template>
  <router-view />
  <BaseToast :visible="visible" :message="message" :type="type" />

</template>


<style scoped>

@media (max-width: 640px) {
  nav ul {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>