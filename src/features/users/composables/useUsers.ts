import { ref, computed } from "vue";
import { i18n } from '@/i18n';
import type {
  User,
  UserResponseDto,
  UserUpdateDto,
  UserListResponseDto,
} from "../types";
import {
  fetchUsers,
  resetCurrentUserPassword as apiResetPwd,
  deleteCurrentUser,
  updateCurrentUser as updateCurrentUserAPI,
} from "../api";
import { getMockUsers } from "../mock";
import { useAuthStore } from "@/features/auth/store";

export const useUsers = () => {
  const users = ref<User[]>([]);
  const loading = ref(true);
  const isMock = ref(false);
  const authStore = useAuthStore();

  const searchQuery = ref("");
  const selectedRole = ref("all");
  const totalItems = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);

  const loadUsers = async (page = 1, limit = 10) => {
    loading.value = true;
    isMock.value = false;
    try {
      const token = authStore.token ?? localStorage.getItem("token");
      if (!token) throw new Error(i18n.global.t('errors.no_token'));

      const data: UserListResponseDto = await fetchUsers(token, page, limit);
      users.value = data.items;
      totalItems.value = data.totalItems;
      totalPages.value = data.totalPages;
      currentPage.value = data.currentPage;
    } catch {
      users.value = getMockUsers();
      totalItems.value = users.value.length;
      totalPages.value = 1;
      currentPage.value = 1;
      isMock.value = true;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrentUser = async (
    updated: UserUpdateDto
  ): Promise<UserResponseDto> => {
    const token = authStore.token ?? localStorage.getItem("token");
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
        (selectedRole.value === "all" || u.roleId === selectedRole.value)
    )
  );

  const resetCurrentUserPassword = async (newPassword: string) => {
    const token = authStore.token ?? localStorage.getItem("token");
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    await apiResetPwd(newPassword, token);
  };

  const deleteMeAccount = async () => {
    const token = authStore.token ?? localStorage.getItem("token");
    if (!token) throw new Error(i18n.global.t('errors.no_token'));

    await deleteCurrentUser(token);
  };

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

    filteredUsers,
  };
};
