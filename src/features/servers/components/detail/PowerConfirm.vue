<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PowerConfirmation } from '../../domain/power';

const props = defineProps<{
  confirmation: PowerConfirmation;
  serverName: string;
}>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();

const { t } = useI18n();
const stop = computed(() => props.confirmation.action === 'stop');
const text = computed(() =>
  props.confirmation.needsMigrationWarning
    ? t(
        'serversPage.power.vms_warning',
        { name: props.serverName, count: props.confirmation.runningVms },
        props.confirmation.runningVms,
      )
    : t(
        stop.value
          ? 'serversPage.power.simple_stop'
          : 'serversPage.power.simple_reset',
      ),
);
const confirmLabel = computed(() => {
  const suffix = props.confirmation.action === 'stop' ? 'stop' : 'reset';
  return t(
    props.confirmation.needsMigrationWarning
      ? `serversPage.power.force_${suffix}`
      : `serversPage.power.confirm_${suffix}`,
  );
});
</script>

<template>
  <div
    role="alertdialog"
    :aria-label="
      t(
        stop ? 'serversPage.power.title_stop' : 'serversPage.power.title_reset',
        { name: serverName },
      )
    "
    :class="[
      'pulse-swap mx-6 mt-4 flex flex-col gap-3 rounded-[14px] border px-[18px] py-4',
      stop
        ? 'border-danger-border bg-danger-surface'
        : 'border-border-strong bg-surface-raised',
    ]"
    :data-warning="confirmation.needsMigrationWarning"
  >
    <span class="font-medium text-text-strong">{{
      t(
        stop ? 'serversPage.power.title_stop' : 'serversPage.power.title_reset',
        { name: serverName },
      )
    }}</span>
    <span class="text-text" data-part="text">{{ text }}</span>
    <div class="flex flex-wrap gap-2">
      <router-link
        v-if="confirmation.needsMigrationWarning"
        to="/migration"
        class="pulse-btn-ghost h-9"
      >
        {{ t('serversPage.power.migrate') }}
      </router-link>
      <button
        type="button"
        :class="[stop ? 'pulse-btn-danger' : 'pulse-btn-primary', 'h-9']"
        data-action="confirm"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
      <button type="button" class="pulse-btn-ghost h-9" @click="emit('cancel')">
        {{ t('serversPage.power.cancel') }}
      </button>
    </div>
  </div>
</template>
