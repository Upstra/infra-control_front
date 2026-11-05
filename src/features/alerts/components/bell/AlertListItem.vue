<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { StatusPill } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { resourceLink } from '../../domain/resource';
import { severityState } from '../../domain/severity';
import type { Alert } from '../../types';

defineProps<{ alert: Alert }>();
const emit = defineEmits<{ navigate: [] }>();

const { t } = useI18n();
const now = useNow({ interval: 30_000 });
</script>

<template>
  <router-link
    :to="resourceLink(alert)"
    class="flex flex-col gap-1.5 rounded-md px-3 py-2.5 hover:bg-surface-raised"
    @click="emit('navigate')"
  >
    <div class="flex items-center gap-2">
      <StatusPill
        :state="severityState[alert.severity]"
        :label="t(`alerts.severity.${alert.severity}`)"
        bare
      />
      <span class="ml-auto font-mono text-overline text-text-muted tnum">
        {{
          t('alerts.bell.since', {
            duration: fmt.since(alert.openedAt, now.getTime()),
          })
        }}
      </span>
    </div>
    <span class="text-body font-medium text-text-strong">{{
      alert.title
    }}</span>
    <span class="font-mono text-caption text-text-muted">{{
      alert.resourceName
    }}</span>
  </router-link>
</template>
