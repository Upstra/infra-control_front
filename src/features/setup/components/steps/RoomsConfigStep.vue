<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight">
        {{ t('setup_room.multi_title') }}
      </h2>
      <p class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto">
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
      >
        <template #item="{ item }">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.name }}
              </h4>
              <div class="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <MapPin :size="14" />
                  {{ item.location }}
                </span>
                <span class="flex items-center gap-1">
                  <Server :size="14" />
                  {{ t('setup_room.capacity_info', { count: item.capacity }) }}
                </span>
                <span class="flex items-center gap-1">
                  <Wind :size="14" />
                  {{ t(`setup_room.cooling_${item.coolingType}`) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </ResourceList>
    </div>

    <RoomFormDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :room="selectedRoom"
      @save="handleSave"
    />

    <TemplateDialog
      v-model:open="templateDialogOpen"
      :templates="setupStore.PREDEFINED_TEMPLATES"
      @apply="handleApplyTemplate"
    />

    <ImportDialog
      v-model:open="importDialogOpen"
      resource-type="rooms"
      @import="handleImportData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { MapPin, Server, Wind } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { SetupStep, type RoomCreationDto } from '../../types';
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

const openEditDialog = (id: string) => {
  const room = setupStore.resources.rooms.find((r: any) => r.id === id);
  if (room) {
    dialogMode.value = 'edit';
    selectedRoom.value = room;
    dialogOpen.value = true;
  }
};

const handleSave = (room: RoomCreationDto) => {
  if (dialogMode.value === 'add') {
    setupStore.addRoom(room);
    toast.success(t('setup_room.room_added'));
  } else if (selectedRoom.value) {
    setupStore.updateRoom(selectedRoom.value.id, room);
    toast.success(t('setup_room.room_updated'));
  }
  dialogOpen.value = false;
};

const handleDelete = (id: string) => {
  if (confirm(t('setup_room.delete_confirm'))) {
    setupStore.removeRoom(id);
    toast.success(t('setup_room.room_deleted'));
  }
};

const handleDuplicate = (id: string) => {
  setupStore.duplicateRoom(id);
  toast.success(t('setup_room.room_duplicated'));
};

const handleImport = () => {
  importDialogOpen.value = true;
};

const handleExport = () => {
  const data = {
    rooms: setupStore.resources.rooms
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
</script>