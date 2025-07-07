import { ref, computed } from 'vue';
import { i18n } from '@/i18n';
import type {
  User,
  UserResponseDto,
  UserUpdateDto,
  UserListResponseDto,
} from '../types';
import {
  fetchUsers,
  resetCurrentUserPassword as apiResetPwd,
  deleteCurrentUser,
  updateCurrentUser as updateCurrentUserAPI,
  toggleUserStatus,
  bulkActivateUsers,
} from '../api';
import { useAuthStore } from '@/features/auth/store';

export const useUsers = () => {
  const users = ref<User[]>([]);
  const loading = ref(true);
  const isMock = ref(false);
  const authStore = useAuthStore();

  const searchQuery = ref('');
  const selectedRole = ref('all');
  const totalItems = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);

  const loadUsers = async (page = 1, limit = 10) => {
    loading.value = true;
    isMock.value = false;
    try {
      const token = authStore.token ?? localStorage.getItem('token');
      if (!token) throw new Error(i18n.global.t('errors.no_token'));

      const data: UserListResponseDto = await fetchUsers(token, page, limit);
      users.value = data.items;
      totalItems.value = data.totalItems;
      totalPages.value = data.totalPages;
      currentPage.value = data.currentPage;
    } catch {
      users.value = [];
      totalItems.value = 0;
      totalPages.value = 0;
      currentPage.value = 1;
      isMock.value = false;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrentUser = async (
    updated: UserUpdateDto,
  ): Promise<UserResponseDto> => {
    const token = authStore.token ?? localStorage.getItem('token');
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    const response = await updateCurrentUserAPI(updated, token);
    authStore.currentUser = response;
    return response;
  };

  const filteredUsers = computed(() =>
    users.value.filter(
      (u) =>
        (u.username + u.email)
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) &&
        (selectedRole.value === 'all' ||
          u.roles?.some((role) => role.id === selectedRole.value)),
    ),
  );

  const resetCurrentUserPassword = async (newPassword: string) => {
    const token = authStore.token ?? localStorage.getItem('token');
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    await apiResetPwd(newPassword, token);
  };

  const deleteMeAccount = async () => {
    const token = authStore.token ?? localStorage.getItem('token');
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    await deleteCurrentUser(token);
  };

  const toggleStatus = async (userId: string) => {
    const token = authStore.token ?? localStorage.getItem('token');
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    const updatedUser = await toggleUserStatus(userId, token);
    const index = users.value.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }
    return updatedUser;
  };

  const activateMultiple = async (userIds: string[]) => {
    const token = authStore.token ?? localStorage.getItem('token');
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    const updatedUsers = await bulkActivateUsers(userIds, token);
    updatedUsers.forEach((updatedUser) => {
      const index = users.value.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
    });
    return updatedUsers;
  };

  const activeUsers = computed(() =>
    filteredUsers.value.filter((u) => u.active),
  );
  const inactiveUsers = computed(() =>
    filteredUsers.value.filter((u) => !u.active),
  );

  return {
    users,
    loading,
    isMock,
    searchQuery,
    selectedRole,
    totalItems,
    totalPages,
    currentPage,

    loadUsers,
    updateCurrentUser,
    resetCurrentUserPassword,
    deleteMeAccount,
    toggleStatus,
    activateMultiple,

    filteredUsers,
    activeUsers,
    inactiveUsers,
  };
};
