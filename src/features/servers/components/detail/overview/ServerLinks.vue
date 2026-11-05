<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { fmt } from '@/shared/utils/fmt';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import { upsCondition } from '@/features/ups/domain/condition';
import { DEFAULT_INLET_WARN_C } from '../../../domain/health';
import type { ServerRowModel } from '../../../domain/row';

const props = defineProps<{
  row: ServerRowModel;
  inletWarnC: number | null | undefined;
  groupName: string | null;
}>();

const { t } = useI18n();
const upsLive = useUpsLiveStore();

const conditionTone: Record<string, string> = {
  on_battery: 'text-danger-text',
  overload: 'text-warning-text',
  replace: 'text-warning-text',
  nominal: 'text-success-text',
};

const links = computed(() => {
  const { server, host } = props.row;
  const upsStatus = server.upsId
    ? (upsLive.statusById[server.upsId] ?? null)
    : null;
  const condition = server.upsId ? upsCondition(upsStatus) : null;
  return [
    {
      key: 'room',
      label: t('serversPage.links.room'),
      value: props.row.roomName ?? t('pulse.empty'),
      note: t('serversPage.links.room_note', {
        threshold: fmt.value(props.inletWarnC ?? DEFAULT_INLET_WARN_C, '°C'),
      }),
      noteClass: 'text-text-muted',
      to: `/rooms/${server.roomId}`,
    },
    {
      key: 'ups',
      label: t('serversPage.links.ups'),
      value: props.row.upsName ?? t('serversPage.links.ups_none'),
      note: condition
        ? t(`upsPage.pill.${condition}`)
        : t('serversPage.links.ups_none_note'),
      noteClass: condition
        ? (conditionTone[condition] ?? 'text-text-muted')
        : 'text-warning-text',
      to: server.upsId ? `/ups/${server.upsId}` : null,
    },
    {
      key: 'vcenter',
      label:
        server.type === 'vcenter'
          ? t('serversPage.links.role')
          : t('serversPage.links.vcenter'),
      value:
        server.type === 'vcenter'
          ? t('serversPage.links.vcenter_role')
          : (host?.name ?? t('pulse.empty')),
      note:
        host?.connectionState === 'connected' || server.type === 'vcenter'
          ? t('serversPage.links.connected')
          : t('serversPage.links.disconnected'),
      noteClass:
        host?.connectionState === 'connected' || server.type === 'vcenter'
          ? 'text-success-text'
          : 'text-danger-text',
      to: null,
    },
    {
      key: 'group',
      label: t('serversPage.links.group'),
      value: `${props.groupName ?? t('serversPage.links.no_group')} · ${server.priority}`,
      note: t('serversPage.links.group_note'),
      noteClass: 'text-text-muted',
      to: '/groups',
    },
  ];
});
</script>

<template>
  <div
    class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 border-t border-surface-raised pt-5"
  >
    <component
      :is="link.to ? 'router-link' : 'div'"
      v-for="link in links"
      :key="link.key"
      :to="link.to ?? undefined"
      :class="[
        'flex flex-col gap-1 rounded-md border border-border px-4 py-3',
        link.to &&
          'transition-colors hover:border-border-strong hover:bg-surface-raised',
      ]"
    >
      <span class="font-mono text-overline text-text-muted">{{
        link.label
      }}</span>
      <span class="font-medium text-text-strong">{{ link.value }}</span>
      <span :class="['text-caption', link.noteClass]">{{ link.note }}</span>
    </component>
  </div>
</template>
