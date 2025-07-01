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
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
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
                      <svg
                        class="w-4 h-4"
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
                      @click.stop="confirmDelete(role)"
                      class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      :disabled="role.isAdmin"
                    >
                      <svg
                        class="w-4 h-4"
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
              </div>
            </div>

            <div
              v-if="isMock && !loading"
              class="p-4 bg-yellow-50 border-t border-yellow-200"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 text-yellow-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-xs text-yellow-800">{{ t('roles.using_mock') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div v-if="selectedRole" class="space-y-6">
            <!-- Role Info Card -->
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
                        <svg
                          class="w-4 h-4 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0 9.972 9.972 0 010 14.142 1 1 0 11-1.414-1.414 7.971 7.971 0 000-11.314 1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
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
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="bg-blue-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg
                          class="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
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
                        <svg
                          class="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 12l5 5L20 7"
                          />
                        </svg>
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
                        <svg
                          class="w-6 h-6 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
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

            <!-- Users in Role -->
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
                    <svg
                      class="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {{ t('roles.assign_users') }}
                  </button>
                </div>
              </div>

              <!-- Users List -->
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
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
                      @click="removeUserFromRole(user.id)"
                      class="text-red-400 hover:text-red-600 transition-colors"
                      :disabled="
                        selectedRole.isAdmin && selectedRole.users.length <= 1
                      "
                    >
                      <svg
                        class="w-4 h-4"
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
              </div>
            </div>
          </div>

          <!-- No Role Selected -->
          <div
            v-else
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
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
      @close="closeModals"
      @save="handleRoleSave"
    />

    <AssignUsersModal
      v-if="showAssignUsersModal"
      :is-open="showAssignUsersModal"
      :role="selectedRole"
      @close="showAssignUsersModal = false"
      @assign="handleUsersAssign"
    />

    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :is-open="showDeleteModal"
      :role="deletingRole"
      @close="showDeleteModal = false"
      @confirm="handleRoleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRolesStore } from '../store';
import type { RoleWithUsers, RoleCreationDto } from '../types';
import RoleModal from '../components/RoleModal.vue';
import AssignUsersModal from '../components/AssignUsersModal.vue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';

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
};

const handleRoleSave = async (roleData: RoleCreationDto) => {
  try {
    if (editingRole.value) {
      await store.updateRole(editingRole.value.id, roleData);
    } else {
      await store.createRole(roleData);
    }
    closeModals();
  } catch (error) {
    console.error('Error saving role:', error);
  }
};

const handleUsersAssign = async (userIds: string[]) => {
  if (!selectedRole.value) return;
  try {
    await store.assignUsersToRole(userIds, selectedRole.value.id);
    showAssignUsersModal.value = false;
  } catch (error) {
    console.error('Error assigning users:', error);
  }
};

const handleRoleDelete = async () => {
  if (!deletingRole.value) return;
  try {
    await store.deleteRole(deletingRole.value.id);
    showDeleteModal.value = false;
    deletingRole.value = null;
  } catch (error) {
    console.error('Error deleting role:', error);
  }
};

onMounted(async () => {
  await store.fetchRolesWithUsers();
});
</script>
