<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { fmt } from '@/shared/utils/fmt';

const { t } = useI18n();
const now = useNow({ interval: 1000 });
const clock = computed(() => fmt.clock(now.value));
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border border-success-border bg-success-surface px-3 py-1 font-mono text-overline text-success-text tnum"
  >
    <span class="pulse-live-dot h-2 w-2 rounded-full bg-success" />{{
      t('upsPage.live', { clock })
    }}
  </span>
</template>
