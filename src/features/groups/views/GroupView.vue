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
            @click="currentViewMode = mode"
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
            @click="openCreateModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon class="w-5 h-5" />
            {{ $t('groups.createGroup') }}
          </button>

          <router-link
            to="/groups/shutdown"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <PowerIcon class="w-5 h-5" />
            {{ $t('groups.groupShutdown') }}
          </router-link>
        </div>
      </div>

      <div
        v-if="currentViewMode === 'flow'"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <GroupFlow
          :groups="groupStore.allGroups"
          @group-click="handleGroupSelect"
        />
      </div>

      <div v-else>
        <GroupList
          :groups="groupStore.allGroups"
          :loading="groupStore.loading"
          :error="groupStore.error"
          :has-more="false"
          :view-mode="currentViewMode as 'grid' | 'list' | 'sections'"
          :resources-map="resourcesMap"
          @create-click="openCreateModal"
          @group-select="handleGroupSelect"
          @group-start="handleGroupStart"
          @group-stop="handleGroupStop"
          @group-menu="handleGroupMenu"
          @load-more="loadMoreGroups"
        />
      </div>
    </div>

    <Teleport to="body">
      <GroupEditModal
        :is-open="showEditModal"
        :group="editingGroup"
        @close="closeEditModal"
        @save="handleSaveGroup"
      />

      <GroupDetailsModal
        v-if="selectedGroup"
        :group="selectedGroup"
        :resources="selectedGroupResources"
        @close="selectedGroup = null"
        @edit="handleEditGroup"
        @delete="handleDeleteGroup"
        @start="handleGroupStart"
        @stop="handleGroupStop"
      />

      <GroupActionMenu
        v-if="contextMenu"
        :position="contextMenu.position"
        :group="contextMenu.group"
        @close="contextMenu = null"
        @edit="handleEditGroup"
        @delete="handleDeleteGroup"
        @start="handleGroupStart"
        @stop="handleGroupStop"
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
import type {
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  GroupServerResponseDto,
  GroupVmResponseDto,
} from '../types';
import GroupList from '../components/GroupList.vue';
import GroupFlow from '../components/GroupFlow.vue';
import GroupEditModal from '../components/GroupEditModal.vue';
import GroupDetailsModal from '../components/GroupDetailsModal.vue';
import GroupActionMenu from '../components/GroupActionMenu.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import {
  Squares2X2Icon,
  ListBulletIcon,
  RectangleGroupIcon,
  ChartBarIcon,
  PowerIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline';
import { useToast } from 'vue-toast-notification';

type ViewMode = 'grid' | 'list' | 'sections' | 'flow';

const { t } = useI18n();
const toast = useToast();
const groupStore = useGroupStore();
const serverStore = useServerStore();

const currentViewMode = ref<ViewMode>('sections');
const viewModes: ViewMode[] = ['sections', 'grid', 'list', 'flow'];
const showEditModal = ref(false);
const editingGroup = ref<Group | null>(null);
const selectedGroup = ref<Group | null>(null);
const showDeleteModal = ref(false);
const groupToDelete = ref<Group | null>(null);
const contextMenu = ref<{
  group: Group;
  position: { x: number; y: number };
} | null>(null);

const resourcesMap = computed(() => {
  const map: Record<
    string,
    Array<{ id: string; name: string; state: 'active' | 'inactive' }>
  > = {};

  groupStore.allGroups.forEach(
    (group: GroupServerResponseDto | GroupVmResponseDto) => {
      if (group.type === 'server') {
        const serverGroup = group as GroupServerResponseDto;
        map[group.id] = (serverGroup.serverIds || []).map((id) => {
          const server = serverStore.list.find((s) => s.id === id);
          return {
            id,
            name: server?.name || `Server ${id}`,
            state: server?.state === 'active' ? 'active' : 'inactive',
          };
        });
      } else {
        const vmGroup = group as GroupVmResponseDto;
        map[group.id] = (vmGroup.vmIds || []).map((id) => ({
          id,
          name: `VM ${id}`,
          state: Math.random() > 0.5 ? 'active' : 'inactive',
        }));
      }
    },
  );

  return map;
});

const selectedGroupResources = computed(() => {
  if (!selectedGroup.value) return [];
  return resourcesMap.value[selectedGroup.value.id] || [];
});

const getViewModeIcon = (mode: ViewMode) => {
  const icons = {
    grid: Squares2X2Icon,
    list: ListBulletIcon,
    sections: RectangleGroupIcon,
    flow: ChartBarIcon,
  };
  return icons[mode];
};

const loadGroups = async () => {
  try {
    await groupStore.loadAllGroups();
  } catch (error) {
    console.error('Failed to load groups:', error);
  }
};

const loadMoreGroups = async () => {
  console.log('Load more groups');
};

const handleGroupSelect = (group: Group) => {
  selectedGroup.value = group;
};

const handleGroupMenu = ({
  group,
  event,
}: {
  group: Group;
  event: MouseEvent;
}) => {
  contextMenu.value = {
    group,
    position: { x: event.clientX, y: event.clientY },
  };
};

const openCreateModal = () => {
  editingGroup.value = null;
  showEditModal.value = true;
};

const handleEditGroup = (group: Group) => {
  contextMenu.value = null;
  selectedGroup.value = null;
  editingGroup.value = group;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingGroup.value = null;
};

const handleSaveGroup = async (
  payload: CreateGroupPayload | UpdateGroupPayload,
) => {
  try {
    if (editingGroup.value) {
      await groupStore.editGroup(
        editingGroup.value.id,
        payload as UpdateGroupPayload,
      );
      toast.success(t('groups.updateSuccess'));
    } else {
      await groupStore.addGroup(payload as CreateGroupPayload);
      toast.success(t('groups.createSuccess'));
    }
    closeEditModal();
  } catch (error) {
    toast.error(
      editingGroup.value ? t('groups.updateError') : t('groups.createError'),
    );
  }
};

const handleDeleteGroup = (group: Group) => {
  groupToDelete.value = group;
  showDeleteModal.value = true;
  contextMenu.value = null;
  selectedGroup.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  groupToDelete.value = null;
};

const confirmDeleteGroup = async () => {
  if (!groupToDelete.value) return;

  try {
    await groupStore.removeGroup(
      groupToDelete.value.id,
      groupToDelete.value.type,
    );
    toast.success(t('groups.deleteSuccess'));
    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting group:', error);
    toast.error(t('groups.deleteError'));
  }
};

const handleGroupStart = async (group: Group) => {
  try {
    const groupsToStart = getGroupsInCascadeOrder(group, 'start');

    for (const g of groupsToStart) {
      await startGroupResources(g);
      toast.success(t('groups.startingGroup', { name: g.name }));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    toast.success(t('groups.startSuccess'));
  } catch (error) {
    toast.error(t('groups.startError'));
  }
};

const handleGroupStop = async (group: Group) => {
  try {
    const groupsToStop = getGroupsInCascadeOrder(group, 'stop');

    for (const g of groupsToStop) {
      await stopGroupResources(g);
      toast.success(t('groups.stoppingGroup', { name: g.name }));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    toast.success(t('groups.stopSuccess'));
  } catch (error) {
    toast.error(t('groups.stopError'));
  }
};

const getGroupsInCascadeOrder = (
  group: Group,
  action: 'start' | 'stop',
): Group[] => {
  if (!group.cascade) return [group];

  const groups: Group[] = [];
  const visited = new Set<string>();

  const traverse = (g: Group) => {
    if (visited.has(g.id)) return;
    visited.add(g.id);

    const dependentGroups = groupStore.allGroups.filter(
      (other: Group) => other.priority === g.priority + 1 && other.cascade,
    );

    if (action === 'stop') {
      dependentGroups.forEach(traverse);
      groups.push(g);
    } else {
      groups.push(g);
      dependentGroups.forEach(traverse);
    }
  };

  traverse(group);
  return groups;
};

const startGroupResources = async (group: Group) => {
  console.log('Starting resources for group:', group.name);
};

const stopGroupResources = async (group: Group) => {
  console.log('Stopping resources for group:', group.name);
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
