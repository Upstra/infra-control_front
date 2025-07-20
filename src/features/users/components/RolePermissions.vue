<template>
  <div class="space-y-6">
    <div
      class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <button
        @click="showBitmaskExplanation = !showBitmaskExplanation"
        class="flex w-full items-center justify-between text-left"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="h-5 w-5 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('permissions.howItWorks') }}
          </h3>
        </div>
        <svg
          :class="[
            'h-5 w-5 text-gray-400 transition-transform',
            showBitmaskExplanation ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div v-show="showBitmaskExplanation" class="mt-4">
        <BitmaskExplanation
          :show-example="true"
          :container-style="false"
          :hide-icon="true"
          :hide-title="true"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="showCreateModal = true"
        type="button"
        class="inline-flex items-center rounded-lg border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium leading-4 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
      >
        <svg
          class="mr-1.5 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {{ $t('permissions.addPermission') }}
      </button>
    </div>
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
                @click="editPermission(permission)"
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
                @click="deletePermission(permission)"
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
      v-if="localPermissions.servers.length === 0"
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
      v-if="editingPermission"
      type="server"
      :permission="editingPermission"
      :resource-name="serverNames[editingPermission.serverId]"
      :is-saving="isSaving"
      :error="saveError"
      @save="handleSavePermission"
      @cancel="cancelEdit"
    />

    <PermissionCreator
      v-if="showCreateModal"
      :show="showCreateModal"
      :role-id="role.id"
      :existing-server-ids="localPermissions.servers.map((p) => p.serverId)"
      @close="showCreateModal = false"
      @created="handlePermissionCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/features/auth/store';
import { fetchServerById } from '@/features/servers/api';
import { permissionServerApi } from '../permission-api';
import { PermissionUtils } from '@/shared/utils/permissions';
import PermissionEditor from './PermissionEditor.vue';
import PermissionCreator from './PermissionCreator.vue';
import BitmaskExplanation from './BitmaskExplanation.vue';
import type { RoleWithPermissions, PermissionServerDto } from '../types';

interface Props {
  role: RoleWithPermissions;
}

const props = defineProps<Props>();

const { t } = useI18n();
const { showToast } = useToast();
const authStore = useAuthStore();
const serverNames = ref<Record<string, string>>({});
const editingPermission = ref<PermissionServerDto | null>(null);
const editingType = ref<'server' | null>(null);
const isSaving = ref(false);
const saveError = ref<string | null>(null);
const showCreateModal = ref(false);
const showBitmaskExplanation = ref(false);

const localPermissions = reactive({
  servers: [...(props.role.permissionServers || [])],
  vms: [...(props.role.permissionVms || [])],
});

watch(
  () => props.role,
  (newRole) => {
    localPermissions.servers = [...(newRole.permissionServers || [])];
    localPermissions.vms = [...(newRole.permissionVms || [])];
  },
  { deep: true },
);

const getActivePermissions = PermissionUtils.getActivePermissions;
const getPermissionLabel = PermissionUtils.getPermissionLabel;
const getPermissionIcon = PermissionUtils.getPermissionIcon;

onMounted(async () => {
  await loadServerNames();
});

async function loadServerNames() {
  const serverIds = localPermissions.servers.map((p) => p.serverId);
  const uniqueIds = [...new Set(serverIds)];

  for (const id of uniqueIds) {
    try {
      const server = await fetchServerById(id);
      serverNames.value[id] = server.name;
    } catch (error) {}
  }
}

function editPermission(permission: PermissionServerDto) {
  editingType.value = 'server';
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

async function handleSavePermission(updatedPermission: PermissionServerDto) {
  isSaving.value = true;
  saveError.value = null;

  try {
    const token = authStore.token!;
    const perm = updatedPermission;

    await permissionServerApi.update(
      perm.serverId,
      perm.roleId,
      { bitmask: perm.bitmask },
      token,
    );

    const index = localPermissions.servers.findIndex(
      (p) => p.serverId === perm.serverId && p.roleId === perm.roleId,
    );
    if (index !== -1) {
      localPermissions.servers[index].bitmask = perm.bitmask;
    }

    showToast(t('permissions.updateSuccess'), { type: 'success' });
    cancelEdit();
  } catch (error: any) {
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

async function deletePermission(permission: PermissionServerDto) {
  if (!confirm(t('permissions.confirmDelete'))) {
    return;
  }

  try {
    const token = authStore.token!;
    const perm = permission;

    await permissionServerApi.delete(perm.serverId, perm.roleId, token);

    const index = localPermissions.servers.findIndex(
      (p) => p.serverId === perm.serverId && p.roleId === perm.roleId,
    );
    if (index !== -1) {
      localPermissions.servers.splice(index, 1);
    }

    showToast(t('permissions.deleteSuccess'), { type: 'success' });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || t('permissions.deleteError');
    showToast(errorMessage, { type: 'error' });
  }
}

async function handlePermissionCreated(permission: PermissionServerDto) {
  localPermissions.servers.push(permission);
  const server = await fetchServerById(permission.serverId);
  serverNames.value[permission.serverId] = server.name;
}
</script>
