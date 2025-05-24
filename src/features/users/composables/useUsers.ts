import { ref, computed } from "vue";
import type { User, UserResponseDto, UserUpdateDto } from "../types";
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

  const loadUsers = async () => {
    loading.value = true;
    try {
      users.value = (await fetchUsers()).data;
    } catch {
      users.value = getMockUsers();
      isMock.value = true;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrentUser = async (
    updated: UserUpdateDto
  ): Promise<UserResponseDto> => {
    const token = authStore.token ?? localStorage.getItem("token");
    if (!token) throw new Error("Aucun token JWT trouvé");

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
    if (!token) throw new Error("Aucun token JWT trouvé");

    await apiResetPwd(newPassword, token);
  };

  const deleteMeAccount = async () => {
    const token = authStore.token ?? localStorage.getItem("token");
    if (!token) throw new Error("Aucun token JWT trouvé");

    await deleteCurrentUser(token);
  };

  return {
    users,
    loading,
    isMock,
    searchQuery,
    selectedRole,

    loadUsers,
    updateCurrentUser,
    resetCurrentUserPassword,
    deleteMeAccount,

    filteredUsers,
  };
};
