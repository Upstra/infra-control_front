<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { StatusPill } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { severityState } from '@/features/alerts/domain/severity';
import { useServerHistory } from '../../../composables/useServerHistory';

const props = defineProps<{ serverId: string }>();

const { t } = useI18n();
const { events, alerts } = useServerHistory(() => props.serverId);
const date = (iso: string) => `${fmt.date(iso)} ${fmt.clock(iso)}`;
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <section class="flex flex-col gap-3">
      <h3 class="m-0 text-card-title text-text-strong">
        {{ t('serversPage.history.alerts') }}
      </h3>
      <ul v-if="alerts.length" class="m-0 flex list-none flex-col gap-2 p-0">
        <li
          v-for="alert in alerts"
          :key="alert.id"
          class="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <StatusPill
              :state="severityState[alert.severity]"
              :label="t(`alerts.severity.${alert.severity}`)"
              bare
            />
            <span
              class="ml-auto font-mono text-overline text-text-muted tnum"
              >{{ date(alert.openedAt) }}</span
            >
          </div>
          <span class="font-medium text-text-strong">{{ alert.title }}</span>
          <span class="text-caption text-text-muted">{{
            t(
              `serversPage.history.${alert.status === 'open' ? 'open' : 'resolved'}`,
            )
          }}</span>
        </li>
      </ul>
      <p v-else class="m-0 text-text-muted">
        {{ t('serversPage.history.empty_alerts') }}
      </p>
    </section>
    <section class="flex flex-col gap-3">
      <h3 class="m-0 text-card-title text-text-strong">
        {{ t('serversPage.history.actions') }}
      </h3>
      <ul v-if="events.length" class="m-0 flex list-none flex-col gap-2 p-0">
        <li
          v-for="event in events"
          :key="event.id"
          class="flex items-center gap-3 rounded-md border border-border px-4 py-3"
        >
          <span class="font-mono text-overline uppercase text-primary-text">{{
            event.action
          }}</span>
          <span class="text-text">{{
            event.user?.username
              ? t('serversPage.history.by', { user: event.user.username })
              : t('serversPage.history.system')
          }}</span>
          <span class="ml-auto font-mono text-overline text-text-muted tnum">{{
            date(event.createdAt)
          }}</span>
        </li>
      </ul>
      <p v-else class="m-0 text-text-muted">
        {{ t('serversPage.history.empty_actions') }}
      </p>
    </section>
  </div>
</template>
