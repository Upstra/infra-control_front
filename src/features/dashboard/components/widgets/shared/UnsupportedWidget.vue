<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div
    class="rounded-lg border border-dashed border-border-strong px-6 py-5 text-text-muted"
  >
    {{ t('widgets.unsupported') }}
  </div>
</template>
