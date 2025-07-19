<template>
  <div class="group-view min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('groups.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('groups.description') }}
        </p>
      </div>

      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="mode in viewModes"
            :key="mode"
            @click="handleViewModeChange(mode)"
            class="px-4 py-2 rounded-lg font-medium transition-colors"
            :class="
              currentViewMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <component
              :is="getViewModeIcon(mode)"
              class="w-5 h-5 inline-block mr-2"
            />
            {{ $t(`groups.view.${mode}`) }}
          </button>
        </div>

        <div class="flex gap-3">
          <button
            v-if="!!isAdmin"
            @click="openCreateModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon class="w-5 h-5" />
            {{ $t('groups.createGroup') }}
          </button>
        </div>
      </div>

      <div>
        <GroupList
          :groups="groupStore.allGroups"
          :loading="groupStore.loading"
          :error="groupStore.error"
          :has-more="false"
          :show-create-button="false"
          :view-mode="currentViewMode as 'grid' | 'list' | 'sections'"
          :resources-map="resourcesMap"
          @create-click="openCreateModal"
          @group-select="handleGroupSelect"
          @group-menu="handleGroupMenu"
          @load-more="loadMoreGroups"
        />
      </div>
    </div>

    <Teleport to="body">
      <GroupManagementPanel
        :is-open="showManagementPanel"
        :group="managementPanelGroup"
        :initial-mode="managementPanelMode"
        @close="closeManagementPanel"
        @success="handleGroupSuccess"
        @delete="handleDeleteGroup"
      />

      <GroupActionMenu
        v-if="contextMenu"
        :position="contextMenu.position"
        :group="contextMenu.group"
        @close="contextMenu = null"
        @edit="handleEditGroup"
        @delete="handleDeleteGroup"
      />

      <DeleteConfirmModal
        :is-open="showDeleteModal"
        :group="groupToDelete"
        :is-deleting="groupStore.isDeleting"
        @close="closeDeleteModal"
        @confirm="confirmDeleteGroup"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGroupStore } from '../store';
import { useServerStore } from '@/features/servers/store';
import { useUserPreferencesStore } from '@/features/settings/store';
import type { GroupResponseDto } from '../types';
import GroupList from '../components/GroupList.vue';
import GroupManagementPanel from '../components/GroupManagementPanel.vue';
import GroupActionMenu from '../components/GroupActionMenu.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import {
  Squares2X2Icon,
  ListBulletIcon,
  RectangleGroupIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline';
import { useToast } from 'vue-toast-notification';
import { useAuthStore } from '@/features/auth/store';

const auth = useAuthStore();

type ViewMode = 'grid' | 'list' | 'sections';

const { t } = useI18n();
const toast = useToast();
const groupStore = useGroupStore();
const serverStore = useServerStore();
const preferencesStore = useUserPreferencesStore();

const currentViewMode = ref<ViewMode>(
  preferencesStore.display.defaultGroupView,
);
const viewModes: ViewMode[] = ['sections', 'grid', 'list'];
const showManagementPanel = ref(false);
const managementPanelGroup = ref<GroupResponseDto | null>(null);
const managementPanelMode = ref<'view' | 'edit' | 'create'>('view');
const showDeleteModal = ref(false);
const groupToDelete = ref<GroupResponseDto | null>(null);
const contextMenu = ref<{
  group: GroupResponseDto;
  position: { x: number; y: number };
} | null>(null);

const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);

const resourcesMap = computed(() => {
  const map: Record<
    string,
    Array<{ id: string; name: string; state: 'active' | 'inactive' }>
  > = {};

  groupStore.allGroups.forEach((group: GroupResponseDto) => {
    map[group.id] = [];
  });

  return map;
});

const getViewModeIcon = (mode: ViewMode) => {
  const icons = {
    grid: Squares2X2Icon,
    list: ListBulletIcon,
    sections: RectangleGroupIcon,
  };
  return icons[mode];
};

const handleViewModeChange = (mode: ViewMode) => {
  currentViewMode.value = mode;
  // Sauvegarder la préférence silencieusement
  preferencesStore.updateNestedPreference('display', 'defaultGroupView', mode, {
    silent: true,
  });
};

const loadGroups = async () => {
  try {
    await groupStore.fetchAllGroups();
  } catch (error) {}
};

const loadMoreGroups = async () => {};

const handleGroupSelect = (group: GroupResponseDto) => {
  managementPanelGroup.value = group;
  managementPanelMode.value = 'view';
  showManagementPanel.value = true;
};

const handleGroupMenu = ({
  group,
  event,
}: {
  group: GroupResponseDto;
  event: MouseEvent;
}) => {
  if (!isAdmin.value) return;
  contextMenu.value = {
    group,
    position: { x: event.clientX, y: event.clientY },
  };
};

const openCreateModal = () => {
  managementPanelGroup.value = null;
  managementPanelMode.value = 'create';
  showManagementPanel.value = true;
};

const handleEditGroup = (group: GroupResponseDto) => {
  contextMenu.value = null;
  managementPanelGroup.value = group;
  managementPanelMode.value = 'edit';
  showManagementPanel.value = true;
};

const closeManagementPanel = () => {
  showManagementPanel.value = false;
  managementPanelGroup.value = null;
};

const handleGroupSuccess = async (updatedGroup?: GroupResponseDto) => {
  await loadGroups(); // Recharger la liste des groupes
  await serverStore.fetchServers(); // Recharger les serveurs pour avoir les groupIds à jour

  if (updatedGroup && managementPanelGroup.value?.id === updatedGroup.id) {
    managementPanelGroup.value = updatedGroup;
  }
};

const handleDeleteGroup = (group: GroupResponseDto) => {
  groupToDelete.value = group;
  showDeleteModal.value = true;
  contextMenu.value = null;
  showManagementPanel.value = false;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  groupToDelete.value = null;
};

const confirmDeleteGroup = async () => {
  if (!groupToDelete.value) return;

  try {
    await groupStore.removeGroup(groupToDelete.value.id);
    toast.success(t('groups.deleteSuccess'));
    closeDeleteModal();
  } catch (error) {
    toast.error(t('groups.deleteError'));
  }
};

onMounted(() => {
  loadGroups();
  if (serverStore.list.length === 0) {
    serverStore.fetchServers();
  }
});
</script>

<style scoped lang="scss">
.group-view {
  min-height: 100vh;
}
</style>
