<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SideDrawer } from '@/shared/components/pulse';
import VmwareDiscoveryProgress from '@/features/vmware/components/VmwareDiscoveryProgress.vue';
import { useVmwareDiscovery } from '@/features/vmware/composables/useVmwareDiscovery';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; done: [] }>();

const { t } = useI18n();
const { startDiscovery, isStartingDiscovery } = useVmwareDiscovery();
const sessionId = ref<string | null>(null);
const failed = ref(false);

// Discovery runs over every vCenter / ESXi of the inventory and saves the
// VMs it finds, exactly like the setup wizard's discovery step.
const start = async () => {
  failed.value = false;
  sessionId.value = null;
  try {
    sessionId.value = (await startDiscovery())?.sessionId ?? null;
    failed.value = !sessionId.value;
  } catch {
    failed.value = true;
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) start();
  },
);

const finish = () => {
  sessionId.value = null;
  emit('done');
  emit('close');
};

const close = () => {
  sessionId.value = null;
  emit('close');
};
</script>

<template>
  <SideDrawer
    :open="open"
    :width="640"
    :title="t('serversPage.discover_drawer.title')"
    :subtitle="t('serversPage.discover_drawer.subtitle')"
    @close="close"
  >
    <VmwareDiscoveryProgress
      v-if="sessionId"
      :key="sessionId"
      :session-id="sessionId"
      embedded
      :on-complete="finish"
      :on-cancel="close"
    />
    <p v-else-if="isStartingDiscovery" class="m-0 text-text-muted">
      {{ t('serversPage.discover_drawer.starting') }}
    </p>
    <div v-else-if="failed" class="flex flex-col items-start gap-3">
      <p class="m-0 text-danger-text" role="alert">
        {{ t('serversPage.discover_drawer.failed') }}
      </p>
      <button type="button" class="pulse-btn-primary" @click="start">
        {{ t('serversPage.discover_drawer.retry') }}
      </button>
    </div>
  </SideDrawer>
</template>
