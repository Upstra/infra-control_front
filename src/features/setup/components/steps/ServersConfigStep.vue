<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup_server.multi_title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto"
      >
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
              <div
                class="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
              >
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
                  {{
                    item.type === 'physical'
                      ? t('setup_server.type_physical')
                      : t('setup_server.type_virtual')
                  }}
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

    <div
      v-if="missingRequiredData.length > 0"
      class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <h4 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
        Données manquantes requises :
      </h4>
      <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
        <li v-for="item in missingRequiredData" :key="item.server.id">
          <strong>{{ item.server.name || 'Serveur sans nom' }}</strong> : 
          {{ item.fields.join(', ') }}
        </li>
      </ul>
    </div>

    <div
      v-if="serversWithoutUps.length > 0"
      class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
    >
      <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
        Avertissement - Serveurs sans onduleur :
      </h4>
      <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
        <li v-for="server in serversWithoutUps" :key="server.id">
          <strong>{{ server.name }}</strong> n'est associé à aucun onduleur
        </li>
      </ul>
    </div>

    <ServerFormDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :server="selectedServer"
      :rooms="setupStore.resources.rooms"
      :ups-list="setupStore.resources.upsList"
      :servers-list="setupStore.resources.servers"
      :has-validation-errors="hasValidationErrors"
      @save="handleSave"
    />

    <ImportDialog
      v-model:open="importDialogOpen"
      resource-type="servers"
      @import="handleImportData"
    />

    <div class="mt-8 flex justify-between">
      <button
        type="button"
        @click="goToPrevStep"
        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ t('common.previous') }}
      </button>

      <button
        type="button"
        @click="goToNextStep"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canProceed"
      >
        {{ t('common.next') }}
        <svg
          class="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, Zap, Globe, HardDrive, Star } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { type BulkServerDto } from '../../types';
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
const hasValidationErrors = ref(false);

const missingRequiredData = computed(() => {
  const missing: Array<{ server: any; fields: string[] }> = [];
  
  setupStore.resources.servers.forEach((server: any) => {
    const missingFields: string[] = [];
    
    if (!server.name) missingFields.push('nom');
    if (!server.ip) missingFields.push('IP');
    if (!server.login) missingFields.push('login');
    if (!server.password) missingFields.push('mot de passe');
    if (!server.adminUrl) missingFields.push('URL admin');
    if (!server.roomId) missingFields.push('salle');
    
    if (server.type === 'physical') {
      if (!server.ilo_name) missingFields.push('nom ILO');
      if (!server.ilo_ip) missingFields.push('IP ILO');
      if (!server.ilo_login) missingFields.push('login ILO');
      if (!server.ilo_password) missingFields.push('mot de passe ILO');
    }
    
    if (missingFields.length > 0) {
      missing.push({ server, fields: missingFields });
    }
  });
  
  return missing;
});

const serversWithoutUps = computed(() => {
  return setupStore.resources.servers.filter((server: any) => !server.upsId || server.upsId === '' || server.upsId === null);
});

const canProceed = computed(() => {
  return setupStore.resources.servers.length > 0 && missingRequiredData.value.length === 0;
});

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

const handleSave = (server: any) => {
  const bulkServer: BulkServerDto = {
    ...server,
    status: server.status as 'connected' | 'pending' | 'error' | undefined,
  };

  if (dialogMode.value === 'add') {
    setupStore.addServer(bulkServer);
    toast.success(t('setup_server.server_added'));
  } else if (selectedServer.value) {
    setupStore.updateServer(selectedServer.value.id, bulkServer);
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
    servers: setupStore.resources.servers,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
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
      const missingFields: string[] = [];
      data.servers.forEach((server: any, index: number) => {
        const requiredFields = [
          'name',
          'ip',
          'login',
          'password',
          'adminUrl',
          'roomId',
          'type',
          'priority',
          'grace_period_on',
          'grace_period_off',
        ];
        const missing = requiredFields.filter((field) => !server[field]);
        if (missing.length > 0) {
          missingFields.push(
            `${t('setup_server.item_type')} ${index + 1}: ${missing.join(', ')}`,
          );
        }
      });

      if (missingFields.length > 0) {
        hasValidationErrors.value = true;
        toast.error(
          t('setup_server.import_validation_error') +
            '\n' +
            missingFields.join('\n'),
          {
            duration: 5000,
          },
        );
        return;
      }

      data.servers.forEach((server: any) => setupStore.addServer(server));
      hasValidationErrors.value = false;
    }
    importDialogOpen.value = false;
    toast.success(t('setup_server.import_success'));
  } catch (error: any) {
    toast.error(error.message);
  }
};

const goToPrevStep = () => {
  setupStore.goToPrevStep();
};

const goToNextStep = () => {
  if (setupStore.resources.servers.length === 0) {
    toast.error(t('setup_server.no_servers_error'));
    return;
  }
  
  if (missingRequiredData.value.length > 0) {
    toast.error('Veuillez compléter toutes les données requises avant de continuer');
    return;
  }
  
  setupStore.goToNextStep();
};
</script>
