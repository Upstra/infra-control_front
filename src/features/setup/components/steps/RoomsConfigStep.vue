<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup_room.multi_title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto"
      >
        {{ t('setup_room.multi_description') }}
      </p>
    </div>

    <div class="max-w-4xl mx-auto w-full">
      <ResourceList
        :title="t('setup_room.list_title')"
        :items="setupStore.resources.rooms"
        :item-type="t('setup_room.item_type')"
        :add-button-text="t('setup_room.add_button')"
        :empty-state-title="t('setup_room.empty_title')"
        :empty-state-description="t('setup_room.empty_description')"
        :show-bulk-actions="true"
        :show-apply-template="true"
        @add="openAddDialog"
        @edit="openEditDialog"
        @delete="handleDelete"
        @duplicate="handleDuplicate"
        @import="handleImport"
        @export="handleExport"
        @apply-template="openTemplateDialog"
        @clear-all="handleClearAll"
      >
        <template #item="{ item }">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.name }}
              </h4>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ t('setup_room.room_description') }}
              </p>
            </div>
          </div>
        </template>
      </ResourceList>
    </div>

    <RoomFormDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :room="selectedRoom"
      :rooms="setupStore.resources.rooms"
      @save="handleSave"
    />

    <TemplateDialog
      v-model:open="templateDialogOpen"
      @apply="handleApplyTemplate"
    />

    <ImportDialog
      v-model:open="importDialogOpen"
      resource-type="rooms"
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
import { useToast } from 'vue-toast-notification';
import { type BulkRoomDto } from '../../types';
import ResourceList from '../ResourceList.vue';
import RoomFormDialog from '../dialogs/RoomFormDialog.vue';
import TemplateDialog from '../dialogs/TemplateDialog.vue';
import ImportDialog from '../dialogs/ImportDialog.vue';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

const dialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const selectedRoom = ref<any>(null);
const templateDialogOpen = ref(false);
const importDialogOpen = ref(false);

onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }
});

const openAddDialog = () => {
  dialogMode.value = 'add';
  selectedRoom.value = null;
  dialogOpen.value = true;
};

const openEditDialog = (id: string | number) => {
  const idStr = String(id);
  const room = setupStore.resources.rooms.find(
    (r: any) => r.id === idStr || r.tempId === idStr,
  );
  if (room) {
    dialogMode.value = 'edit';
    selectedRoom.value = room;
    dialogOpen.value = true;
  }
};

const handleSave = (room: BulkRoomDto) => {
  if (dialogMode.value === 'add') {
    setupStore.addRoom(room);
    toast.success(t('setup_room.room_added'));
  } else if (selectedRoom.value) {
    setupStore.updateRoom(selectedRoom.value.id, room);
    toast.success(t('setup_room.room_updated'));
  }
  dialogOpen.value = false;
};

const handleDelete = (id: string | number) => {
  if (confirm(t('setup_room.delete_confirm'))) {
    setupStore.removeRoom(String(id));
    toast.success(t('setup_room.room_deleted'));
  }
};

const handleDuplicate = (id: string | number) => {
  setupStore.duplicateRoom(String(id));
  toast.success(t('setup_room.room_duplicated'));
};

const handleImport = () => {
  importDialogOpen.value = true;
};

const handleExport = () => {
  const data = {
    rooms: setupStore.resources.rooms,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rooms-export.json';
  a.click();
  URL.revokeObjectURL(url);
  toast.success(t('setup_room.export_success'));
};

const openTemplateDialog = () => {
  templateDialogOpen.value = true;
};

const handleApplyTemplate = (template: any) => {
  setupStore.applyTemplate(template);
  templateDialogOpen.value = false;
  toast.success(t('setup_room.template_applied'));
};

const handleImportData = async (data: any) => {
  try {
    await setupStore.importConfiguration(data);
    importDialogOpen.value = false;
    toast.success(t('setup_room.import_success'));
  } catch (error: any) {
    toast.error(error.message);
  }
};

const handleClearAll = () => {
  if (confirm(t('setup_room.clear_all_confirm'))) {
    setupStore.resources.rooms = [];
    toast.success(t('setup_room.clear_all_success'));
  }
};

const goToPrevStep = () => {
  setupStore.goToPrevStep();
};

const goToNextStep = async () => {
  try {
    const { roomApi } = await import('@/features/rooms/api');
    const existingRooms = await roomApi.fetchRooms(false, 1, 100);

    if (
      setupStore.resources.rooms.length === 0 &&
      existingRooms.items.length === 0
    ) {
      toast.error(t('setup_room.no_room_error'));
      return;
    }
  } catch (error) {
    console.warn('Could not fetch existing rooms:', error);
  }

  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }

  setupStore.goToNextStep();
};
</script>
