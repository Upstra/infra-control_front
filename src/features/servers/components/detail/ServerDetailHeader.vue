<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Activity,
  LoaderCircle,
  SquareTerminal,
  Play,
  RotateCcw,
  Power,
} from 'lucide-vue-next';
import { StatusPill } from '@/shared/components/pulse';
import { pillState } from '../../domain/health';
import { useServerReason } from '../../composables/useServerReason';
import type { PowerAction, PowerBlock } from '../../domain/power';
import type { ServerRowModel } from '../../domain/row';

const props = defineProps<{
  row: ServerRowModel;
  pinging: boolean;
  block: PowerBlock;
}>();
const emit = defineEmits<{ ping: []; ssh: []; power: [action: PowerAction] }>();

const { t } = useI18n();
const { pillKey } = useServerReason();

const server = computed(() => props.row.server);
const off = computed(() => props.row.health.reasons[0]?.kind === 'powered_off');
const blockReason = computed(() =>
  props.block ? t(`serversPage.detail.blocked.${props.block}`) : undefined,
);
const sub = computed(() =>
  t('serversPage.detail.sub', {
    ip: server.value.ip,
    type: server.value.type.toUpperCase(),
    room: props.row.roomName ?? t('pulse.empty'),
    ups: props.row.upsName ?? t('serversPage.reason.no_ups'),
  }),
);
</script>

<template>
  <div class="flex flex-wrap items-start gap-4 px-6 pt-6">
    <div class="flex min-w-0 flex-col gap-1.5">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="m-0 font-mono text-title text-text-strong">
          {{ server.name }}
        </h2>
        <StatusPill
          :state="pillState(row.health.state)"
          :label="t(`serversPage.state.${pillKey(row)}`)"
        />
      </div>
      <span class="font-mono text-caption text-text-muted tnum">{{ sub }}</span>
    </div>
    <div class="flex-1" />
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="pulse-btn-ghost h-9"
        :disabled="pinging"
        @click="emit('ping')"
      >
        <LoaderCircle
          v-if="pinging"
          class="pulse-spin h-3.5 w-3.5"
          aria-hidden="true"
        />
        <Activity v-else class="h-3.5 w-3.5" aria-hidden="true" />{{
          t('serversPage.detail.ping')
        }}
      </button>
      <button type="button" class="pulse-btn-ghost h-9" @click="emit('ssh')">
        <SquareTerminal class="h-3.5 w-3.5" aria-hidden="true" />{{
          t('serversPage.detail.ssh')
        }}
      </button>
      <span :title="blockReason" class="flex gap-2">
        <button
          v-if="off"
          type="button"
          class="pulse-btn-ghost h-9"
          :disabled="!!block"
          data-power="start"
          @click="emit('power', 'start')"
        >
          <Play class="h-3.5 w-3.5" aria-hidden="true" />{{
            t('serversPage.detail.start')
          }}
        </button>
        <template v-else>
          <button
            type="button"
            class="pulse-btn-ghost h-9"
            :disabled="!!block"
            data-power="reset"
            @click="emit('power', 'reset')"
          >
            <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />{{
              t('serversPage.detail.reset')
            }}
          </button>
          <button
            type="button"
            class="pulse-btn-danger-ghost h-9"
            :disabled="!!block"
            data-power="stop"
            @click="emit('power', 'stop')"
          >
            <Power class="h-3.5 w-3.5" aria-hidden="true" />{{
              t('serversPage.detail.stop')
            }}
          </button>
        </template>
      </span>
    </div>
  </div>
</template>
