<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { User } from '../types';
import UserCard from '../components/UserCard.vue';
import UserEditModal from '../components/UserEditModal.vue';
import UserCreateModal from '../components/UserCreateModal.vue';
import UserActionsModal from '../components/UserActionsModal.vue';
import UserTable from '../components/UserTable.vue';
import UserFilterHeader from '../components/UserFilterHeader.vue';
import PaginationControls from '../components/PaginationControls.vue';
import { useUsers } from '../composables/useUsers';
import { useRoles } from '@/features/roles/composables/useRoles';
import { useCommandPalette } from '@/shared/composables/useCommandPalette';
import { toggleUserStatus } from '../api';
import { useAuthStore } from '@/features/auth/store';
import { ClockIcon } from '@heroicons/vue/24/solid';
import { useI18n } from 'vue-i18n';

const error = ref('');
const selectedUser = ref<User | null>(null);
const isCardView = ref(false);
const isEditModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const isActionsModalOpen = ref(false);
const copiedEmail = ref<string | null>(null);
const page = ref(1);
const pageSize = 5;
const { t } = useI18n();
const authStore = useAuthStore();

const {
  filteredUsers,
  searchQuery,
  selectedRole,
  loading,
  isMock,
  loadUsers,
  totalItems,
} = useUsers();
const { loadRoles, roles } = useRoles();
const { registerViewSwitchHandler, unregisterViewSwitchHandler } =
  useCommandPalette();

const paginatedUsers = computed(() => filteredUsers.value);

const openEditModal = (user: User) => {
  selectedUser.value = { ...user };
  isActionsModalOpen.value = true;
};
const handleEditUser = () => {
  isEditModalOpen.value = true;
  isActionsModalOpen.value = false;
};
const handleDeleteUser = (user: User) => {
  if (confirm(t('users.delete_confirm', { username: user.username }))) {
    // TODO: implement user deletion
  }
};
const handleUserUpdate = (_: User) => {
  //TODO: Update users
  //updateUser(updatedUser)
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
  } catch (err) {
    console.error('Failed to toggle user status:', err);
  }
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
      <UserTable
        v-if="!isCardView"
        :users="paginatedUsers"
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
          v-for="user in paginatedUsers"
          :key="user.id"
          :user="user"
          :roles="roles"
          @edit="openEditModal"
        />
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
      @editRole="() => {}"
      @deleteUser="handleDeleteUser"
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
  </div>
</template>

<style scoped>
.group:hover {
  transform: scale(1.01);
}
</style>
