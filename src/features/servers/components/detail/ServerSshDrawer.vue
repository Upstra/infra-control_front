<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SideDrawer } from '@/shared/components/pulse';
import SshAuthModal from '../SshAuthModal.vue';
import type { Server } from '../../types';

const SshTerminal = defineAsyncComponent(() => import('../SshTerminal.vue'));

const props = defineProps<{ open: boolean; server: Server }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const credentials = ref<{ username: string; password: string } | null>(null);
const asking = ref(false);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      credentials.value = null;
      asking.value = false;
      return;
    }
    if (props.server.login && props.server.password) {
      credentials.value = {
        username: props.server.login,
        password: props.server.password,
      };
    } else {
      asking.value = true;
    }
  },
  { immediate: true },
);

const connect = (value: { username: string; password: string }) => {
  credentials.value = { username: value.username, password: value.password };
  asking.value = false;
};

const cancelAuth = () => {
  asking.value = false;
  emit('close');
};
</script>

<template>
  <SideDrawer
    :open="open && !!credentials"
    :title="t('serversPage.ssh.title', { name: server.name })"
    :width="760"
    @close="emit('close')"
  >
    <div
      class="h-[70vh] overflow-hidden rounded-md border border-border bg-page"
    >
      <SshTerminal
        v-if="credentials"
        :ip="server.ip"
        :username="credentials.username"
        :password="credentials.password"
        class="h-full"
        @close="emit('close')"
      />
    </div>
  </SideDrawer>
  <SshAuthModal
    :is-open="open && asking"
    :server-ip="server.ip"
    :default-username="server.login || ''"
    @close="cancelAuth"
    @connect="connect"
  />
</template>
