<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ t('roles.management_title') }}</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ t('roles.management_description') }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              {{ t('roles.create_role') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">{{ t('roles.roles') }}</h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('roles.total_roles', { count: rolesWithUsers.length }) }}
              </p>
            </div>

            <div v-if="loading" class="p-6">
              <div class="animate-pulse space-y-4">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-16 bg-gray-200 rounded-lg"
                ></div>
              </div>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <div
                v-for="role in rolesWithUsers"
                :key="role.id"
                @click="selectRole(role.id)"
                class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{
                  'bg-blue-50 border-r-2 border-blue-500':
                    selectedRole?.id === role.id,
                }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <h3 class="text-sm font-medium text-gray-900">
                        {{ role.name }}
                      </h3>
                      <span
                        v-if="role.isAdmin"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {{ t('roles.admin') }}
                      </span>
                      <span
                        v-else-if="role.canCreateServer"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                      >
                        {{ t('roles.elevated') }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ role.userCount }}
                      {{ role.userCount === 1 ? t('roles.user') : t('roles.users') }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button
                      @click.stop="editRole(role)"
                      class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      v-if="canDeleteRole(role)"
                      @click.stop="confirmDelete(role)"
                      class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      :disabled="role.isAdmin"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="isMock && !loading"
              class="p-4 bg-yellow-50 border-t border-yellow-200"
            >
              <div class="flex items-center">
                <ExclamationTriangleIcon class="w-4 h-4 text-yellow-400 mr-2" />
                <span class="text-xs text-yellow-800">{{ t('roles.using_mock') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div v-if="selectedRole" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center space-x-3">
                      <h2 class="text-xl font-semibold text-gray-900">
                        {{ selectedRole.name }}
                      </h2>
                      <span
                        v-if="selectedRole.isAdmin"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                      >
                        <SpeakerWaveIcon class="w-4 h-4 mr-1.5" />
                        {{ t('roles.admin') }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ t('roles.role_id') }} {{ selectedRole.id }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editRole(selectedRole)"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {{ t('roles.edit_role') }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <!-- Message informatif pour les rôles système -->
                <div v-if="selectedRole.name === 'GUEST' || selectedRole.name === 'ADMIN'" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <ShieldCheckIcon class="h-5 w-5 text-blue-400" />
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-blue-700">
                        <span v-if="selectedRole.name === 'GUEST'">
                          {{ t('roles.guest_role_info') }}
                        </span>
                        <span v-else-if="selectedRole.name === 'ADMIN'">
                          {{ t('roles.admin_role_info') }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="bg-blue-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <UserGroupIcon class="w-6 h-6 text-blue-600" />
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-blue-900">
                          {{ t('roles.total_users') }}
                        </p>
                        <p class="text-2xl font-bold text-blue-600">
                          {{ selectedRole.userCount }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-green-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <CheckIcon class="w-6 h-6 text-green-600" />
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-green-900">
                          {{ t('roles.active_users') }}
                        </p>
                        <p class="text-2xl font-bold text-green-600">
                          {{ activeUsersCount }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <ShieldCheckIcon class="w-6 h-6 text-purple-600" />
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-purple-900">
                          {{ t('roles.permissions') }}
                        </p>
                        <p class="text-2xl font-bold text-purple-600">
                          {{ totalPermissions }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ t('roles.users_with_role') }}
                  </h3>
                  <button
                    @click="showAssignUsersModal = true"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon class="w-4 h-4 mr-1.5" />
                    {{ t('roles.assign_users') }}
                  </button>
                </div>
              </div>

              <div v-if="userLoading" class="p-6">
                <div class="animate-pulse space-y-4">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="h-12 bg-gray-200 rounded-lg"
                  ></div>
                </div>
              </div>

              <div
                v-else-if="selectedRole.users.length === 0"
                class="p-6 text-center"
              >
                <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">
                  {{ t('roles.no_users_assigned') }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ t('roles.get_started_assigning') }}
                </p>
              </div>

              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="user in selectedRole.users"
                  :key="user.id"
                  class="p-4 flex items-center justify-between hover:bg-gray-50"
                >

                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
                      >
                        <span class="text-sm font-medium text-gray-700">
                          {{ user.firstName ? user.firstName[0] : ''
                          }}{{ user.lastName ? user.lastName[0] : '' }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ user.firstName }} {{ user.lastName }}
                      </p>
                      <p class="text-sm text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': user.active,
                        'bg-gray-100 text-gray-800': !user.active,
                      }"
                    >
                      {{ user.active ? t('roles.active') : t('roles.inactive') }}
                    </span>
                    <button
                      v-if="canRemoveUserFromRole(user)"
                      @click="removeUserFromRole(user.id)"
                      class="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <ShieldCheckIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-lg font-medium text-gray-900">
              {{ t('roles.select_role') }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ t('roles.select_role_hint') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <RoleModal
      v-if="showCreateModal || showEditModal"
      :is-open="showCreateModal || showEditModal"
      :role="editingRole"
      :error="createError"
      @close="closeModals"
      @save="handleRoleSave"
    />

    <AssignUsersModal
      v-if="showAssignUsersModal"
      :is-open="showAssignUsersModal"
      :role="selectedRole"
      :error="assignError"
      @close="() => { showAssignUsersModal = false; assignError = ''; }"
      @assign="handleUsersAssign"
    />

    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :is-open="showDeleteModal"
      :role="deletingRole"
      :error="deleteError"
      @close="closeDeleteModal"
      @confirm="handleRoleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRolesStore } from '../store';
import type { RoleWithUsers, AdminRoleCreationDto } from '../types';
import RoleModal from '../components/RoleModal.vue';
import AssignUsersModal from '../components/AssignUsersModal.vue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  CheckIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline';

const store = useRolesStore();
const { rolesWithUsers, selectedRole, loading, userLoading, isMock } =
  storeToRefs(store);

const { t } = useI18n();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showAssignUsersModal = ref(false);
const showDeleteModal = ref(false);

const editingRole = ref<RoleWithUsers | null>(null);
const deletingRole = ref<RoleWithUsers | null>(null);

const createError = ref('');
const deleteError = ref('');
const assignError = ref('');
const activeUsersCount = computed(() => {
  const users = selectedRole.value?.users;
  if (!Array.isArray(users)) return 0;
  return users.filter((user) => user.active).length;
});

const totalPermissions = computed(() => {
  const role = selectedRole.value;
  if (!role) return 0;
  return role.permissionServers.length + role.permissionVms.length;
});

// Vérifie si un rôle peut être supprimé selon les règles métier
const canDeleteRole = (role: RoleWithUsers): boolean => {
  // Ne peut pas supprimer les rôles système ADMIN et GUEST
  if (role.name === 'ADMIN' || role.name === 'GUEST') {
    return false;
  }
  
  // Ne peut pas supprimer un rôle admin s'il est marqué comme tel
  if (role.isAdmin) {
    return false;
  }
  
  return true;
};

// Vérifie si un utilisateur peut être retiré d'un rôle
const canRemoveUserFromRole = (user: any): boolean => {
  // Si c'est le rôle GUEST et que l'utilisateur n'a que ce rôle, on ne peut pas le retirer
  if (selectedRole.value?.name === 'GUEST' && 
      user.roles?.length === 1 && 
      user.roles[0].name === 'GUEST') {
    return false;
  }
  
  // Si c'est un rôle admin et qu'il ne reste qu'un utilisateur, on ne peut pas le retirer
  if (selectedRole.value?.isAdmin && selectedRole.value.users.length <= 1) {
    return false;
  }
  
  return true;
};

const selectRole = async (roleId: string) => {
  await store.selectRole(roleId);
};

const editRole = (role: RoleWithUsers) => {
  editingRole.value = role;
  showEditModal.value = true;
};

const confirmDelete = (role: RoleWithUsers) => {
  if (role.isAdmin) return;
  deletingRole.value = role;
  showDeleteModal.value = true;
};

const removeUserFromRole = async (userId: string) => {
  if (selectedRole.value?.isAdmin && selectedRole.value.users.length <= 1) {
    return;
  }
  try {
    await store.removeUserFromRoleAction(userId);
  } catch (error) {
    console.error('Error removing user from role:', error);
  }
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingRole.value = null;
  createError.value = '';
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingRole.value = null;
  deleteError.value = '';
};

const handleRoleSave = async (roleData: AdminRoleCreationDto) => {
  createError.value = '';
  try {
    if (editingRole.value) {
      await store.updateRole(editingRole.value.id, roleData);
    } else {
      await store.createAdminRole(roleData);
    }
    closeModals();
  } catch (err: any) {
    createError.value =
      err?.response?.data?.message || t('roles.errors.saving_error');
  }
};

const handleUsersAssign = async (userIds: string[]) => {
  if (!selectedRole.value) return;
  assignError.value = '';
  try {
    await store.assignUsersToRole(userIds, selectedRole.value.id);
    showAssignUsersModal.value = false;
  } catch (err: any) {
    assignError.value = 
      err?.response?.data?.message || t('roles.errors.assign_error');
  }
};

const handleRoleDelete = async () => {
  if (!deletingRole.value) return;
  deleteError.value = '';
  try {
    await store.deleteRole(deletingRole.value.id);
    closeDeleteModal();
  } catch (err: any) {
    deleteError.value = err?.response?.message || t('roles.errors.deleting');
  }
};

onMounted(async () => {
  await store.fetchRolesWithUsers();
});
</script>
