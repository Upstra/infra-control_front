<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { User } from '../types';
import UserCard from '../components/UserCard.vue';
import UserEditModal from '../components/UserEditModal.vue';
import UserCreateModal from '../components/UserCreateModal.vue';
import UserActionsModal from '../components/UserActionsModal.vue';
import UserEditRoleModal from '../components/UserEditRoleModal.vue';
import UserResetPasswordModal from '../components/UserResetPasswordModal.vue';
import UserTable from '../components/UserTable.vue';
import UserFilterHeader from '../components/UserFilterHeader.vue';
import PaginationControls from '../components/PaginationControls.vue';
import InactiveUsersSection from '../components/InactiveUsersSection.vue';
import { useUsers } from '../composables/useUsers';
import { useRoles } from '@/features/roles/composables/useRoles';
import { useCommandPalette } from '@/shared/composables/useCommandPalette';
import { toggleUserStatus, deleteUser } from '../api';
import { useAuthStore } from '@/features/auth/store';
import { useToast } from '@/composables/useToast';
import { ClockIcon } from '@heroicons/vue/24/solid';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/shared/composables/useToast';

const error = ref('');
const selectedUser = ref<User | null>(null);
const isCardView = ref(false);
const isEditModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const isActionsModalOpen = ref(false);
const isEditRoleModalOpen = ref(false);
const isResetPasswordModalOpen = ref(false);
const copiedEmail = ref<string | null>(null);
const page = ref(1);
const pageSize = 5;
const { t } = useI18n();
const authStore = useAuthStore();
const { showSuccess, showError } = useToast();

const {
  activeUsers,
  inactiveUsers,
  searchQuery,
  selectedRole,
  loading,
  isMock,
  loadUsers,
  totalItems,
  toggleStatus,
  activateMultiple,
} = useUsers();
const { loadRoles, roles } = useRoles();
const { registerViewSwitchHandler, unregisterViewSwitchHandler } =
  useCommandPalette();
const { showSuccess } = useToast();

const paginatedActiveUsers = computed(() => activeUsers.value);

const openEditModal = (user: User) => {
  selectedUser.value = { ...user };
  isActionsModalOpen.value = true;
};
const handleEditUser = () => {
  isEditRoleModalOpen.value = true;
  isActionsModalOpen.value = false;
};

const handleResetPassword = () => {
  isResetPasswordModalOpen.value = true;
  isActionsModalOpen.value = false;
};

const handleDeleteUser = async (user: User) => {
  if (confirm(t('users.delete_confirm', { username: user.username }))) {
    try {
      await deleteUser(user.id, authStore.token!);
      showSuccess(t('users.delete_success', { username: user.username }));
      loadUsers(page.value, pageSize);
      closeActionsModal();
    } catch (err) {
      showError(t('users.delete_error'));
    }
  }
};

const handleToggleStatus = async (user: User) => {
  try {
    await toggleStatus(user.id);
    showSuccess(t('users.activation_success'));
    closeActionsModal();
  } catch (error) {
    console.error('Failed to toggle user status:', error);
  }
};

const handleActivateUser = async (user: User) => {
  try {
    await toggleStatus(user.id);
    showSuccess(t('users.activation_success'));
  } catch (error) {
    console.error('Failed to activate user:', error);
  }
};

const handleActivateSelected = async (users: User[]) => {
  try {
    const userIds = users.map((u) => u.id);
    await activateMultiple(userIds);
    showSuccess(t('users.bulk_activation_success', { count: users.length }));
  } catch (error) {
    console.error('Failed to activate users:', error);
  }
};
const handleUserUpdate = (_: User) => {
  //TODO: Update users
  closeEditModal();
};
const closeActionsModal = () => {
  selectedUser.value = null;
  isActionsModalOpen.value = false;
};
const closeEditModal = () => {
  selectedUser.value = null;
  isEditModalOpen.value = false;
};

const closeEditRoleModal = () => {
  selectedUser.value = null;
  isEditRoleModalOpen.value = false;
};

const closeResetPasswordModal = () => {
  selectedUser.value = null;
  isResetPasswordModalOpen.value = false;
};

const handleUserUpdated = () => {
  showSuccess(t('users.update_success'));
  loadUsers(page.value, pageSize);
};

const handlePasswordReset = () => {
  showSuccess(t('users.password_reset_success'));
};
const handleSwitchView = (view: 'card' | 'table') => {
  isCardView.value = view === 'card';
};
const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email);
  copiedEmail.value = email;
  setTimeout(() => (copiedEmail.value = null), 1200);
};

const openCreateModal = () => {
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const handleUserCreated = () => {
  loadUsers(page.value, pageSize);
};

const handleToggleUserStatus = async (user: User) => {
  try {
    await toggleUserStatus(user.id, authStore.token!);
    loadUsers(page.value, pageSize);
    closeActionsModal();
  } catch (err) {}
};

onMounted(() => {
  loadUsers(page.value, pageSize);
  loadRoles();
  registerViewSwitchHandler(handleSwitchView);
});

onUnmounted(() => {
  unregisterViewSwitchHandler();
});
watch(page, () => loadUsers(page.value, pageSize));
watch([searchQuery, selectedRole], () => (page.value = 1));
</script>

<template>
  <div class="max-w-7xl mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('users.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ t('users.subtitle') }}
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {{ t('users.create_user') }}
      </button>
    </div>

    <UserFilterHeader
      v-model:search="searchQuery"
      v-model:role="selectedRole"
      :roles="roles"
      :isMock="isMock"
      :isCardView="isCardView"
      @toggle-view="handleSwitchView"
    />

    <div
      v-if="loading"
      class="text-center text-neutral-dark dark:text-neutral-300 flex items-center justify-center gap-2"
    >
      <ClockIcon class="w-5 h-5 animate-spin" />
      {{ t('users.loading') }}
    </div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

    <template v-else>
      <div class="space-y-6">
        <InactiveUsersSection
          v-if="inactiveUsers.length > 0"
          :users="inactiveUsers"
          :roles="roles"
          @activateUser="handleActivateUser"
          @activateSelected="handleActivateSelected"
          @editUser="openEditModal"
        />

        <div
          class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow ring-1 ring-neutral-200 dark:ring-neutral-700"
        >
          <div class="flex items-center gap-3 mb-4">
            <UserGroupIcon class="w-6 h-6 text-primary dark:text-blue-400" />
            <h3
              class="text-lg font-semibold text-neutral-darker dark:text-white"
            >
              {{ t('users.active_users') }}
            </h3>
            <span
              class="px-2 py-1 text-sm font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full"
            >
              {{ activeUsers.length }}
            </span>
          </div>

          <UserTable
            v-if="!isCardView"
            :users="paginatedActiveUsers"
            :roles="roles"
            :copiedEmail="copiedEmail"
            @copyEmail="copyEmail"
            @edit="openEditModal"
          />
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <UserCard
              v-for="user in paginatedActiveUsers"
              :key="user.id"
              :user="user"
              :roles="roles"
              @edit="openEditModal"
            />
          </div>
        </div>
      </div>

      <PaginationControls
        :currentPage="page"
        :totalItems="totalItems"
        :pageSize="pageSize"
        @update:page="page = $event"
      />
    </template>

    <UserActionsModal
      :user="selectedUser"
      :isOpen="isActionsModalOpen"
      :roles="roles"
      @close="closeActionsModal"
      @editUser="handleEditUser"
      @editRole="handleEditUser"
      @deleteUser="handleDeleteUser"
      @resetPassword="handleResetPassword"
      @toggleUserStatus="handleToggleUserStatus"
    />
    <UserEditModal
      :user="selectedUser"
      :roles="roles"
      :isOpen="isEditModalOpen"
      @close="closeEditModal"
      @submit="handleUserUpdate"
    />
    <UserCreateModal
      :isOpen="isCreateModalOpen"
      :roles="roles"
      @close="closeCreateModal"
      @user-created="handleUserCreated"
    />
    <UserEditRoleModal
      :user="selectedUser"
      :isOpen="isEditRoleModalOpen"
      :roles="roles"
      @close="closeEditRoleModal"
      @userUpdated="handleUserUpdated"
    />
    <UserResetPasswordModal
      :user="selectedUser"
      :isOpen="isResetPasswordModalOpen"
      @close="closeResetPasswordModal"
      @passwordReset="handlePasswordReset"
    />
  </div>
</template>

<style scoped>
.group:hover {
  transform: scale(1.01);
}
</style>
