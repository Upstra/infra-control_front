<template>
  <div class="min-h-screen bg-surface-sunken">
    <div
      class="bg-surface border-b border-border"
    >
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text-strong">
              {{ t('roles.management_title') }}
            </h1>
            <p class="text-sm text-text-muted mt-1">
              {{ t('roles.management_description') }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
          <Card>
            <CardHeader>
              <CardTitle>
                {{ t('roles.roles') }}
              </CardTitle>
              <p class="text-sm text-text-muted mt-1">
                {{ t('roles.total_roles', { count: rolesWithUsers.length }) }}
              </p>
            </CardHeader>

            <div v-if="loading" class="p-6">
              <div class="animate-pulse space-y-4">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-16 bg-surface-raised rounded-lg"
                ></div>
              </div>
            </div>

            <div
              v-else
              class="divide-y divide-border"
            >
              <div
                v-for="role in rolesWithUsers"
                :key="role.id"
                @click="selectRole(role.id)"
                class="p-4 hover:bg-surface-sunken cursor-pointer transition-colors"
                :class="{
                  'bg-[rgb(var(--c-primary-hover)/0.1)] border-r-2 border-primary':
                    selectedRole?.id === role.id,
                }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <h3
                        class="text-sm font-medium text-text-strong"
                      >
                        {{ role.name }}
                      </h3>
                      <span
                        v-if="role.isAdmin"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger-surface text-danger-text"
                      >
                        {{ t('roles.admin') }}
                      </span>
                      <span
                        v-else-if="role.canCreateServer"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-surface text-warning-text"
                      >
                        {{ t('roles.elevated') }}
                      </span>
                    </div>
                    <p class="text-xs text-text-muted mt-1">
                      {{ role.userCount }}
                      {{
                        role.userCount === 1
                          ? t('roles.user')
                          : t('roles.users')
                      }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button
                      @click.stop="editRole(role)"
                      class="p-1 text-text-muted hover:text-text transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      v-if="canDeleteRole(role)"
                      @click.stop="confirmDelete(role)"
                      class="p-1 text-text-muted hover:text-danger-text transition-colors"
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
              class="p-4 bg-warning-surface border-t border-warning/40"
            >
              <div class="flex items-center">
                <ExclamationTriangleIcon
                  class="w-4 h-4 text-warning-text mr-2"
                />
                <span class="text-xs text-warning-text">{{
                  t('roles.using_mock')
                }}</span>
              </div>
            </div>
          </Card>
        </div>

        <div class="lg:col-span-2">
          <div v-if="selectedRole" class="space-y-6">
            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center space-x-3">
                      <h2
                        class="text-xl font-semibold text-text-strong"
                      >
                        {{ selectedRole.name }}
                      </h2>
                      <span
                        v-if="selectedRole.isAdmin"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-danger-surface text-danger-text"
                      >
                        <SpeakerWaveIcon class="w-4 h-4 mr-1.5" />
                        {{ t('roles.admin') }}
                      </span>
                    </div>
                    <p class="text-sm text-text-muted mt-1">
                      {{ t('roles.role_id') }} {{ selectedRole.id }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editRole(selectedRole)"
                      class="inline-flex items-center px-3 py-2 border border-border-control shadow-sm text-sm leading-4 font-medium rounded-lg text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {{ t('roles.edit_role') }}
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div
                  v-if="
                    selectedRole.name === 'GUEST' ||
                    selectedRole.name === 'ADMIN'
                  "
                  class="mb-4 p-3 bg-[rgb(var(--c-primary-hover)/0.1)] border border-primary-dark rounded-md"
                >
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <ShieldCheckIcon
                        class="h-5 w-5 text-primary-text"
                      />
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-primary-text">
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
                  <div class="bg-[rgb(var(--c-primary-hover)/0.1)] rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <UserGroupIcon
                          class="w-6 h-6 text-primary-text"
                        />
                      </div>
                      <div class="ml-3">
                        <p
                          class="text-sm font-medium text-primary-text"
                        >
                          {{ t('roles.total_users') }}
                        </p>
                        <p
                          class="text-2xl font-bold text-primary-text"
                        >
                          {{ selectedRole.userCount }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-success-surface rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <CheckIcon
                          class="w-6 h-6 text-success-text"
                        />
                      </div>
                      <div class="ml-3">
                        <p
                          class="text-sm font-medium text-success-text"
                        >
                          {{ t('roles.active_users') }}
                        </p>
                        <p
                          class="text-2xl font-bold text-success-text"
                        >
                          {{ activeUsersCount }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-purple-50 rounded-lg p-4"
                  >
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <ShieldCheckIcon
                          class="w-6 h-6 text-purple-600"
                        />
                      </div>
                      <div class="ml-3">
                        <p
                          class="text-sm font-medium text-purple-900"
                        >
                          {{ t('roles.permissions') }}
                        </p>
                        <p
                          class="text-2xl font-bold text-purple-600"
                        >
                          {{ totalPermissions }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <h3
                    class="text-lg font-semibold text-text-strong"
                  >
                    {{ t('roles.users_with_role') }}
                  </h3>
                  <button
                    @click="showAssignUsersModal = true"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-primary-text bg-[rgb(var(--c-primary-hover)/0.1)] hover:bg-[rgb(var(--c-primary-hover)/0.1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <PlusIcon class="w-4 h-4 mr-1.5" />
                    {{ t('roles.assign_users') }}
                  </button>
                </div>
              </CardHeader>

              <div v-if="userLoading" class="p-6">
                <div class="animate-pulse space-y-4">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="h-12 bg-surface-raised rounded-lg"
                  ></div>
                </div>
              </div>

              <div
                v-else-if="selectedRole.users.length === 0"
                class="p-6 text-center"
              >
                <UserGroupIcon
                  class="mx-auto h-12 w-12 text-text-muted"
                />
                <h3
                  class="mt-2 text-sm font-medium text-text-strong"
                >
                  {{ t('roles.no_users_assigned') }}
                </h3>
                <p class="mt-1 text-sm text-text-muted">
                  {{ t('roles.get_started_assigning') }}
                </p>
              </div>

              <div
                v-else
                class="divide-y divide-border"
              >
                <div
                  v-for="user in selectedRole.users"
                  :key="user.id"
                  class="p-4 flex items-center justify-between hover:bg-surface-sunken"
                >
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-border-strong rounded-full flex items-center justify-center"
                      >
                        <span
                          class="text-sm font-medium text-text"
                        >
                          {{ user.firstName ? user.firstName[0] : ''
                          }}{{ user.lastName ? user.lastName[0] : '' }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p
                        class="text-sm font-medium text-text-strong"
                      >
                        {{ user.firstName }} {{ user.lastName }}
                      </p>
                      <p class="text-sm text-text-muted">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-success-surface text-success-text':
                          user.isActive,
                        'bg-surface-raised text-text-strong':
                          !user.isOnline,
                      }"
                    >
                      {{
                        user.isOnline ? t('roles.active') : t('roles.inactive')
                      }}
                    </span>
                    <button
                      v-if="canRemoveUserFromRole(user)"
                      @click="removeUserFromRole(user.id)"
                      class="text-danger-text hover:text-danger-text transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <h3 class="text-lg font-semibold text-text-strong">
                  {{ t('roles.permissions') }}
                </h3>
              </CardHeader>
              <CardContent>
                <RolePermissions
                  :role="selectedRole"
                  @update="selectRole(selectedRole.id)"
                />
              </CardContent>
            </Card>
          </div>

          <Card v-else>
            <CardContent class="p-12 text-center">
              <ShieldCheckIcon
                class="mx-auto h-12 w-12 text-text-muted"
              />
              <h3
                class="mt-2 text-lg font-medium text-text-strong"
              >
                {{ t('roles.select_role') }}
              </h3>
              <p class="mt-1 text-sm text-text-muted">
                {{ t('roles.select_role_hint') }}
              </p>
            </CardContent>
          </Card>
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
      @close="
        () => {
          showAssignUsersModal = false;
          assignError = '';
        }
      "
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
import type { RoleWithUsers, AdminRoleCreationDto, User } from '../types';
import RoleModal from '../components/RoleModal.vue';
import AssignUsersModal from '../components/AssignUsersModal.vue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import RolePermissions from '@/features/users/components/RolePermissions.vue';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline';
import Card from '@/shared/components/Card.vue';
import CardHeader from '@/shared/components/CardHeader.vue';
import CardTitle from '@/shared/components/CardTitle.vue';
import CardContent from '@/shared/components/CardContent.vue';

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
  return users.filter((user: User) => user.isOnline).length;
});

const totalPermissions = computed(() => {
  const role = selectedRole.value;
  if (!role) return 0;
  return role.permissionServers.length;
});

const canDeleteRole = (role: RoleWithUsers): boolean => {
  if (role.name === 'ADMIN' || role.name === 'GUEST') {
    return false;
  }

  if (role.isAdmin) {
    return false;
  }

  return true;
};

const canRemoveUserFromRole = (user: any): boolean => {
  if (
    selectedRole.value?.name === 'GUEST' &&
    user.roles?.length === 1 &&
    user.roles[0].name === 'GUEST'
  ) {
    return false;
  }

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
  } catch (error) {}
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
