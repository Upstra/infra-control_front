<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { User } from '../types';
import UserCard from '../components/UserCard.vue';
import UserEditModal from '../components/UserEditModal.vue';
import UserActionsModal from '../components/UserActionsModal.vue';
import UserTable from '../components/UserTable.vue';
import UserFilterHeader from '../components/UserFilterHeader.vue';
import PaginationControls from '../components/PaginationControls.vue';
import { useUsers } from '../composables/useUsers';
import { useRoles } from '@/features/roles/composables/useRoles';
import { useCommandPalette } from '@/shared/composables/useCommandPalette';
import { ClockIcon } from '@heroicons/vue/24/solid';
import { useI18n } from 'vue-i18n';

const error = ref('');
const selectedUser = ref<User | null>(null);
const isCardView = ref(false);
const isEditModalOpen = ref(false);
const isActionsModalOpen = ref(false);
const copiedEmail = ref<string | null>(null);
const page = ref(1);
const pageSize = 5;
const { t } = useI18n();

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
    />
    <UserEditModal
      :user="selectedUser"
      :roles="roles"
      :isOpen="isEditModalOpen"
      @close="closeEditModal"
      @submit="handleUserUpdate"
    />
  </div>
</template>

<style scoped>
.group:hover {
  transform: scale(1.01);
}
</style>
