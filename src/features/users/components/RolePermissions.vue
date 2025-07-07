<template>
  <div class="space-y-6">
    <div v-if="localPermissions.servers.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('permissions.servers') }}
      </h3>
      <div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <div
          v-for="permission in localPermissions.servers"
          :key="permission.id"
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ serverNames[permission.serverId] || permission.serverId }}
              </h4>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ $t('permissions.bitmask') }}: {{ permission.bitmask }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editPermission('server', permission)"
                class="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                @click="deletePermission('server', permission)"
                class="rounded-md p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="perm in getActivePermissions(permission.bitmask)"
              :key="perm"
              class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            >
              <i :class="getPermissionIcon(perm)" class="text-sm"></i>
              {{ $t(getPermissionLabel(perm)) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="localPermissions.vms.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('permissions.vms') }}
      </h3>
      <div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <div
          v-for="permission in localPermissions.vms"
          :key="permission.id"
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ vmNames[permission.vmId] || permission.vmId }}
              </h4>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ $t('permissions.bitmask') }}: {{ permission.bitmask }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editPermission('vm', permission)"
                class="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                @click="deletePermission('vm', permission)"
                class="rounded-md p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="perm in getActivePermissions(permission.bitmask)"
              :key="perm"
              class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            >
              <i :class="getPermissionIcon(perm)" class="text-sm"></i>
              {{ $t(getPermissionLabel(perm)) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        localPermissions.servers.length === 0 &&
        localPermissions.vms.length === 0
      "
      class="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t('permissions.noPermissions') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('permissions.noPermissionsDescription') }}
      </p>
    </div>

    <PermissionEditor
      v-if="editingPermission && editingType"
      :type="editingType"
      :permission="editingPermission"
      :resource-name="
        editingType === 'server'
          ? serverNames[(editingPermission as PermissionServerDto).serverId]
          : vmNames[(editingPermission as PermissionVmDto).vmId]
      "
      :is-saving="isSaving"
      :error="saveError"
      @save="handleSavePermission"
      @cancel="cancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/features/auth/store';
import { fetchServerById } from '@/features/servers/api';
import { fetchVmById } from '@/features/vms/api';
import { permissionServerApi, permissionVmApi } from '../permission-api';
import { PermissionUtils } from '@/shared/utils/permissions';
import PermissionEditor from './PermissionEditor.vue';
import type {
  RoleWithPermissions,
  PermissionServerDto,
  PermissionVmDto,
} from '../types';

interface Props {
  role: RoleWithPermissions;
}

const props = defineProps<Props>();

const { t } = useI18n();
const { showToast } = useToast();
const authStore = useAuthStore();
const serverNames = ref<Record<string, string>>({});
const vmNames = ref<Record<string, string>>({});
const editingPermission = ref<PermissionServerDto | PermissionVmDto | null>(
  null,
);
const editingType = ref<'server' | 'vm' | null>(null);
const isSaving = ref(false);
const saveError = ref<string | null>(null);

// Create reactive local copy of permissions
const localPermissions = reactive({
  servers: [...props.role.permissionServers],
  vms: [...props.role.permissionVms],
});

// Watch for prop changes and update local state
watch(
  () => props.role,
  (newRole) => {
    localPermissions.servers = [...newRole.permissionServers];
    localPermissions.vms = [...newRole.permissionVms];
  },
  { deep: true },
);

const getActivePermissions = PermissionUtils.getActivePermissions;
const getPermissionLabel = PermissionUtils.getPermissionLabel;
const getPermissionIcon = PermissionUtils.getPermissionIcon;

onMounted(async () => {
  await Promise.all([loadServerNames(), loadVmNames()]);
});

async function loadServerNames() {
  const serverIds = localPermissions.servers.map((p) => p.serverId);
  const uniqueIds = [...new Set(serverIds)];

  for (const id of uniqueIds) {
    try {
      const server = await fetchServerById(id);
      serverNames.value[id] = server.name;
    } catch (error) {
      console.error(`Failed to load server ${id}:`, error);
    }
  }
}

async function loadVmNames() {
  const vmIds = localPermissions.vms.map((p) => p.vmId);
  const uniqueIds = [...new Set(vmIds)];

  for (const id of uniqueIds) {
    try {
      const vm = await fetchVmById(id);
      vmNames.value[id] = vm.name;
    } catch (error) {
      console.error(`Failed to load VM ${id}:`, error);
    }
  }
}

function editPermission(
  type: 'server' | 'vm',
  permission: PermissionServerDto | PermissionVmDto,
) {
  editingType.value = type;
  editingPermission.value = { ...permission };
  saveError.value = null;
  isSaving.value = false;
}

function cancelEdit() {
  editingType.value = null;
  editingPermission.value = null;
  saveError.value = null;
  isSaving.value = false;
}

async function handleSavePermission(
  updatedPermission: PermissionServerDto | PermissionVmDto,
) {
  isSaving.value = true;
  saveError.value = null;

  try {
    const token = authStore.token!;

    if (editingType.value === 'server') {
      const perm = updatedPermission as PermissionServerDto;
      await permissionServerApi.update(
        perm.serverId,
        perm.roleId,
        { bitmask: perm.bitmask },
        token,
      );

      // Update local state dynamically
      const index = localPermissions.servers.findIndex(
        (p) => p.serverId === perm.serverId && p.roleId === perm.roleId,
      );
      if (index !== -1) {
        localPermissions.servers[index].bitmask = perm.bitmask;
      }
    } else {
      const perm = updatedPermission as PermissionVmDto;
      await permissionVmApi.update(
        perm.vmId,
        perm.roleId,
        { bitmask: perm.bitmask },
        token,
      );

      // Update local state dynamically
      const index = localPermissions.vms.findIndex(
        (p) => p.vmId === perm.vmId && p.roleId === perm.roleId,
      );
      if (index !== -1) {
        localPermissions.vms[index].bitmask = perm.bitmask;
      }
    }

    showToast(t('permissions.updateSuccess'), { type: 'success' });
    cancelEdit();
  } catch (error: any) {
    console.error('Failed to update permission:', error);
    const errorMessage =
      error?.response?.data?.message?.[0] ||
      error?.response?.data?.message ||
      t('permissions.updateError');
    saveError.value = errorMessage;
    showToast(errorMessage, { type: 'error' });
  } finally {
    isSaving.value = false;
  }
}

async function deletePermission(
  type: 'server' | 'vm',
  permission: PermissionServerDto | PermissionVmDto,
) {
  if (!confirm(t('permissions.confirmDelete'))) {
    return;
  }

  try {
    const token = authStore.token!;

    if (type === 'server') {
      const perm = permission as PermissionServerDto;
      await permissionServerApi.delete(perm.serverId, perm.roleId, token);

      // Remove from local state dynamically
      const index = localPermissions.servers.findIndex(
        (p) => p.serverId === perm.serverId && p.roleId === perm.roleId,
      );
      if (index !== -1) {
        localPermissions.servers.splice(index, 1);
      }
    } else {
      const perm = permission as PermissionVmDto;
      await permissionVmApi.delete(perm.vmId, perm.roleId, token);

      // Remove from local state dynamically
      const index = localPermissions.vms.findIndex(
        (p) => p.vmId === perm.vmId && p.roleId === perm.roleId,
      );
      if (index !== -1) {
        localPermissions.vms.splice(index, 1);
      }
    }

    showToast(t('permissions.deleteSuccess'), { type: 'success' });
  } catch (error: any) {
    console.error('Failed to delete permission:', error);
    const errorMessage =
      error?.response?.data?.message || t('permissions.deleteError');
    showToast(errorMessage, { type: 'error' });
  }
}
</script>
