<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ArrowUpRight } from 'lucide-vue-next';
import { useAlertAcknowledge } from '../../composables/useAlertAcknowledge';
import { resourceLink } from '../../domain/resource';
import type { Alert } from '../../types';

defineProps<{ incident: Alert }>();

const { t } = useI18n();
const { toggle, pending, canAcknowledge } = useAlertAcknowledge();
</script>

<template>
  <div
    role="status"
    :class="[
      'flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5',
      incident.acknowledged
        ? 'border-border-strong bg-surface'
        : 'border-danger-border bg-danger-surface shadow-glow-danger',
    ]"
  >
    <span
      :class="[
        'inline-flex h-6 items-center rounded-full px-2.5 font-mono text-overline',
        incident.acknowledged
          ? 'bg-surface-raised text-text-muted'
          : 'bg-danger-solid text-on-primary',
      ]"
      >{{
        incident.acknowledged
          ? t('alerts.banner.acked')
          : t('alerts.banner.critical')
      }}</span
    >
    <span class="min-w-0 flex-1 truncate font-medium text-text-strong">{{
      incident.title
    }}</span>
    <button
      v-if="canAcknowledge(incident)"
      type="button"
      :disabled="pending"
      class="pulse-press h-8 rounded-md border border-border-strong px-3 text-caption font-medium text-text-strong hover:bg-surface-raised"
      @click="toggle(incident)"
    >
      {{
        incident.acknowledged
          ? t('alerts.banner.reopen')
          : t('alerts.banner.acknowledge')
      }}
    </button>
    <router-link
      :to="resourceLink(incident)"
      class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-caption font-medium text-text hover:bg-surface-raised"
    >
      {{ t('alerts.banner.open', { name: incident.resourceName }) }}
      <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
    </router-link>
  </div>
</template>
