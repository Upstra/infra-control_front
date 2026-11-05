<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-text-strong tracking-tight"
      >
        {{ t('setup_ups.multi_title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-text-strong max-w-lg mx-auto"
      >
        {{ t('setup_ups.multi_description') }}
      </p>
    </div>

    <div class="max-w-4xl mx-auto w-full">
      <ResourceList
        :title="t('setup_ups.list_title')"
        :items="setupStore.resources.upsList"
        :item-type="t('setup_ups.item_type')"
        :add-button-text="t('setup_ups.add_button')"
        :empty-state-title="t('setup_ups.empty_title')"
        :empty-state-description="t('setup_ups.empty_description')"
        :show-bulk-actions="true"
        :show-status="true"
        @add="openAddDialog"
        @edit="openEditDialog"
        @delete="handleDelete"
        @duplicate="handleDuplicate"
        @import="handleImport"
        @export="handleExport"
        @clear-all="handleClearAll"
      >
        <template #item="{ item }">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-text-strong">
                {{ item.name }}
              </h4>
              <div
                class="mt-1 flex items-center gap-4 text-sm text-text-muted"
              >
                <span class="flex items-center gap-1">
                  <Building2 :size="14" />
                  {{ getRoomName(item.roomId) }}
                </span>
                <span class="flex items-center gap-1">
                  <Globe :size="14" />
                  {{ item.ip }}
                </span>
                <span v-if="item.brand" class="flex items-center gap-1">
                  <Package :size="14" />
                  {{ item.brand }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </ResourceList>
    </div>

    <UpsFormDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :ups="selectedUps"
      :rooms="setupStore.resources.rooms"
      :ups-list="setupStore.resources.upsList"
      :servers-list="setupStore.resources.servers"
      @save="handleSave"
    />

    <ImportDialog
      v-model:open="importDialogOpen"
      resource-type="ups"
      @import="handleImportData"
    />

    <div class="mt-8 flex justify-between">
      <button
        type="button"
        @click="goToPrevStep"
        class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="false"
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
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, Globe, Package } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { type BulkUpsDto } from '../../types';
import ResourceList from '../ResourceList.vue';
import UpsFormDialog from '../dialogs/UpsFormDialog.vue';
import ImportDialog from '../dialogs/ImportDialog.vue';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

const dialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const selectedUps = ref<any>(null);
const importDialogOpen = ref(false);

onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }
});

const getRoomName = (roomId: string) => {
  const room = setupStore.resources.rooms.find(
    (r: any) => r.id === roomId || r.tempId === roomId,
  );
  return room?.name || t('setup_ups.unknown_room');
};

const openAddDialog = () => {
  dialogMode.value = 'add';
  selectedUps.value = null;
  dialogOpen.value = true;
};

const openEditDialog = (id: string | number) => {
  const idStr = String(id);
  const ups = setupStore.resources.upsList.find(
    (u: any) => u.id === idStr || u.tempId === idStr,
  );
  if (ups) {
    dialogMode.value = 'edit';
    selectedUps.value = ups;
    dialogOpen.value = true;
  }
};

const handleSave = (ups: any) => {
  const bulkUps: BulkUpsDto = {
    ...ups,
    tempId: ups.tempId || ups.id,
  };

  if (dialogMode.value === 'add') {
    setupStore.addUps(bulkUps);
    toast.success(t('setup_ups.ups_added'));
  } else if (selectedUps.value) {
    setupStore.updateUps(selectedUps.value.id, bulkUps);
    toast.success(t('setup_ups.ups_updated'));
  }

  dialogOpen.value = false;
};

const handleDelete = (id: string | number) => {
  if (confirm(t('setup_ups.delete_confirm'))) {
    setupStore.removeUps(String(id));
    toast.success(t('setup_ups.ups_deleted'));
  }
};

const handleDuplicate = (id: string | number) => {
  setupStore.duplicateUps(String(id));
  toast.success(t('setup_ups.ups_duplicated'));
};

const handleImport = () => {
  importDialogOpen.value = true;
};

const handleExport = () => {
  const data = {
    upsList: setupStore.resources.upsList,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ups-export.json';
  a.click();
  URL.revokeObjectURL(url);
  toast.success(t('setup_ups.export_success'));
};

const handleImportData = (data: any) => {
  try {
    if (data.upsList) {
      data.upsList.forEach((ups: any) => setupStore.addUps(ups));
    }
    importDialogOpen.value = false;
    toast.success(t('setup_ups.import_success'));
  } catch (error: any) {
    toast.error(error.message);
  }
};

const handleClearAll = () => {
  if (confirm(t('setup_ups.clear_all_confirm'))) {
    setupStore.resources.upsList = [];
    toast.success(t('setup_ups.clear_all_success'));
  }
};

const goToPrevStep = () => {
  setupStore.goToPrevStep();
};

const goToNextStep = async () => {
  try {
    const { upsApi } = await import('@/features/ups/api');
    const existingUps = await upsApi.getAllAdmin();

    if (setupStore.resources.upsList.length === 0 && existingUps.length === 0) {
      toast.error(t('setup_ups.no_ups_error'));
      return;
    }
  } catch (error) {
    console.warn('Could not fetch existing UPS:', error);
  }

  setupStore.goToNextStep();
};
</script>
