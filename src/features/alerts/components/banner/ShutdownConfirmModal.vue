<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/shared/components/Modal.vue';
import { upsApi } from '@/features/ups/api';
import { useShutdownPlan } from '../../composables/useShutdownPlan';
import type { ConnectedServer } from '@/features/ups/types';

const props = defineProps<{ open: boolean; upsId: string; upsName: string }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const { start, starting } = useShutdownPlan();
const servers = ref<ConnectedServer[]>([]);

watch(
  () => [props.open, props.upsId] as const,
  async ([open, id]) => {
    if (!open) return;
    servers.value = [];
    const ups = await upsApi.getById(id).catch(() => null);
    servers.value = ups?.servers ?? [];
  },
  { immediate: true },
);

const confirm = async () => {
  if (await start()) emit('close');
};
</script>

<template>
  <Modal :open="open" size="md" @close="emit('close')">
    <template #header>{{ t('alerts.shutdown.title') }}</template>
    <p class="mb-3 text-body text-text-muted">
      {{ t('alerts.shutdown.message', { name: upsName }) }}
    </p>
    <ul v-if="servers.length" class="flex flex-col gap-1 font-mono text-code">
      <li v-for="server in servers" :key="server.id" class="text-text-strong">
        {{ server.name }}
        <span class="text-text-muted">· {{ server.ip }}</span>
      </li>
    </ul>
    <p v-else class="text-body text-text-muted">
      {{ t('alerts.shutdown.no_servers') }}
    </p>
    <template #footer>
      <button
        type="button"
        :disabled="starting"
        class="pulse-press h-10 rounded-md bg-danger-solid px-4 font-medium text-on-primary hover:bg-danger disabled:opacity-60"
        @click="confirm"
      >
        {{ t('alerts.shutdown.confirm') }}
      </button>
      <button
        type="button"
        class="pulse-press h-10 rounded-md border border-border-control px-4 font-medium text-text hover:bg-surface-raised"
        @click="emit('close')"
      >
        {{ t('alerts.shutdown.cancel') }}
      </button>
    </template>
  </Modal>
</template>
