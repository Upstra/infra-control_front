<script setup lang="ts">
import IncidentZone from '@/features/alerts/components/banner/IncidentZone.vue';

defineProps<{ editing?: boolean }>();
</script>

<template>
  <IncidentZone :show-placeholder="editing" />
</template>
