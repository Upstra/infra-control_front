<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ArrowUpRight } from 'lucide-vue-next';
import { StatusGlyph } from '@/shared/components/pulse';
import { resourceLink } from '../../domain/resource';
import type { Alert } from '../../types';

defineProps<{ alerts: Alert[] }>();

const { t } = useI18n();
</script>

<template>
  <div class="flex w-full flex-col gap-2 border-t border-danger-border pt-5">
    <span class="font-mono text-overline uppercase text-danger-text">
      {{ t('alerts.banner.others', alerts.length) }}
    </span>
    <router-link
      v-for="alert in alerts"
      :key="alert.id"
      :to="resourceLink(alert)"
      class="flex items-center gap-3 rounded-md px-2 py-1.5 text-text hover:bg-surface-raised"
    >
      <StatusGlyph state="down" />
      <span class="truncate">{{ alert.title }}</span>
      <ArrowUpRight
        class="ml-auto h-3.5 w-3.5 text-text-muted"
        aria-hidden="true"
      />
    </router-link>
  </div>
</template>
