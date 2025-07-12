<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight">
        {{ t('setup_server.multi_title') }}
      </h2>
      <p class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto">
        {{ t('setup_server.multi_description') }}
      </p>
    </div>

    <div class="max-w-4xl mx-auto w-full">
      <ResourceList
        :title="t('setup_server.list_title')"
        :items="setupStore.resources.servers"
        :item-type="t('setup_server.item_type')"
        :add-button-text="t('setup_server.add_button')"
        :empty-state-title="t('setup_server.empty_title')"
        :empty-state-description="t('setup_server.empty_description')"
        :show-bulk-actions="true"
        :show-status="true"
        @add="openAddDialog"
        @edit="openEditDialog"
        @delete="handleDelete"
        @duplicate="handleDuplicate"
        @import="handleImport"
        @export="handleExport"
      >
        <template #item="{ item }">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.name }}
              </h4>
              <div class="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <Building2 :size="14" />
                  {{ getRoomName(item.roomId) }}
                </span>
                <span class="flex items-center gap-1">
                  <Zap :size="14" />
                  {{ getUpsName(item.upsId) }}
                </span>
                <span class="flex items-center gap-1">
                  <Globe :size="14" />
                  {{ item.ip }}
                </span>
                <span class="flex items-center gap-1">
                  <HardDrive :size="14" />
                  {{ item.type === 'physical' ? t('setup_server.type_physical') : t('setup_server.type_virtual') }}
                </span>
                <span v-if="item.priority" class="flex items-center gap-1">
                  <Star :size="14" />
                  {{ t('setup_server.priority_label') }}: {{ item.priority }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </ResourceList>
    </div>

    <ServerFormDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :server="selectedServer"
      :rooms="setupStore.resources.rooms"
      :ups-list="setupStore.resources.upsList"
      @save="handleSave"
    />

    <ImportDialog
      v-model:open="importDialogOpen"
      resource-type="servers"
      @import="handleImportData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, Zap, Globe, HardDrive, Star } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { type ServerCreationDto } from '../../types';
import ResourceList from '../ResourceList.vue';
import ServerFormDialog from '../dialogs/ServerFormDialog.vue';
import ImportDialog from '../dialogs/ImportDialog.vue';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

const dialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const selectedServer = ref<any>(null);
const importDialogOpen = ref(false);

onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }
});

const getRoomName = (roomId: string) => {
  const room = setupStore.resources.rooms.find((r: any) => r.id === roomId);
  return room?.name || t('setup_server.unknown_room');
};

const getUpsName = (upsId: string) => {
  const ups = setupStore.resources.upsList.find((u: any) => u.id === upsId);
  return ups?.name || t('setup_server.no_ups_assigned');
};

const openAddDialog = () => {
  dialogMode.value = 'add';
  selectedServer.value = null;
  dialogOpen.value = true;
};

const openEditDialog = (id: string | number) => {
  const idStr = String(id);
  const server = setupStore.resources.servers.find((s: any) => s.id === idStr);
  if (server) {
    dialogMode.value = 'edit';
    selectedServer.value = server;
    dialogOpen.value = true;
  }
};

const handleSave = async (server: ServerCreationDto & { status?: string }) => {
  if (dialogMode.value === 'add') {
    setupStore.addServer(server);
    toast.success(t('setup_server.server_added'));
  } else if (selectedServer.value) {
    setupStore.updateServer(selectedServer.value.id, server);
    toast.success(t('setup_server.server_updated'));
  }
  dialogOpen.value = false;
};

const handleDelete = (id: string | number) => {
  if (confirm(t('setup_server.delete_confirm'))) {
    setupStore.removeServer(String(id));
    toast.success(t('setup_server.server_deleted'));
  }
};

const handleDuplicate = (id: string | number) => {
  setupStore.duplicateServer(String(id));
  toast.success(t('setup_server.server_duplicated'));
};

const handleImport = () => {
  importDialogOpen.value = true;
};

const handleExport = () => {
  const data = {
    servers: setupStore.resources.servers
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'servers-export.json';
  a.click();
  URL.revokeObjectURL(url);
  toast.success(t('setup_server.export_success'));
};

const handleImportData = async (data: any) => {
  try {
    if (data.servers) {
      data.servers.forEach((server: any) => setupStore.addServer(server));
    }
    importDialogOpen.value = false;
    toast.success(t('setup_server.import_success'));
  } catch (error: any) {
    toast.error(error.message);
  }
};
</script>