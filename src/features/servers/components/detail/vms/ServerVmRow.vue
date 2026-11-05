<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Play, RotateCcw, Power, LoaderCircle } from 'lucide-vue-next';
import { StatusPill } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { vmHealth, vmStateLabel } from '@/features/vms/domain/presentation';
import type { Vm } from '@/features/vms/types';
import type { VmAction } from '../../../composables/useServerVms';

const props = defineProps<{ vm: Vm; busy: VmAction | null; armed: boolean }>();
const emit = defineEmits<{ start: []; restart: []; stop: [] }>();

const { t } = useI18n();
const health = computed(() => vmHealth(props.vm));
const off = computed(
  () =>
    health.value === 'down' || props.vm.metrics?.powerState === 'poweredOff',
);
const label = computed(() => {
  if (props.busy)
    return t(
      `serversPage.vms.${props.busy === 'start' ? 'starting' : props.busy === 'restart' ? 'restarting' : 'stopping'}`,
    );
  const { key, params } = vmStateLabel(props.vm);
  return t(key, params ?? {});
});
</script>

<template>
  <div
    class="grid grid-cols-[2.5fr_2fr_1fr_1fr_2fr] items-center gap-4 border-t border-surface-raised px-4 py-3.5 transition-colors hover:bg-surface-raised"
    :data-vm="vm.name"
  >
    <div class="flex min-w-0 flex-col">
      <span class="truncate font-mono text-text-strong">{{ vm.name }}</span>
      <span class="truncate text-caption text-text-muted tnum">{{
        vm.ip ?? t('pulse.empty')
      }}</span>
    </div>
    <StatusPill
      :state="busy ? 'degraded' : health"
      :label="label"
      bare
      data-part="state"
    />
    <span class="font-mono text-text tnum">{{
      fmt.percent(vm.cpuPercent)
    }}</span>
    <span class="font-mono text-text-muted tnum">{{
      off ? t('pulse.empty') : fmt.duration(vm.uptimeSeconds)
    }}</span>
    <div
      class="flex justify-end gap-1.5"
      role="group"
      :aria-label="t('serversPage.vms.actions_aria', { name: vm.name })"
    >
      <LoaderCircle
        v-if="busy"
        class="pulse-spin h-4 w-4 text-primary-text"
        aria-hidden="true"
      />
      <button
        v-else-if="off"
        type="button"
        class="pulse-btn-ghost h-8 px-3 text-caption"
        data-action="start"
        @click="emit('start')"
      >
        <Play class="h-3.5 w-3.5" aria-hidden="true" />{{
          t('serversPage.vms.start')
        }}
      </button>
      <template v-else>
        <button
          type="button"
          class="pulse-btn-ghost h-8 px-3 text-caption"
          data-action="restart"
          @click="emit('restart')"
        >
          <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />{{
            t('serversPage.vms.restart')
          }}
        </button>
        <button
          type="button"
          :class="[
            armed ? 'pulse-btn-danger' : 'pulse-btn-danger-ghost',
            'h-8 px-3 text-caption',
          ]"
          data-action="stop"
          @click="emit('stop')"
        >
          <Power class="h-3.5 w-3.5" aria-hidden="true" />{{
            armed
              ? t('serversPage.vms.stop_confirm')
              : t('serversPage.vms.stop')
          }}
        </button>
      </template>
    </div>
  </div>
</template>
