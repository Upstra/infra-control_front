import { ref, computed } from "vue";
import type { User } from "../types";
import {
  fetchUsers,
  resetCurrentUserPassword as apiResetPwd,
  deleteCurrentUser,
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

  const updateUser = (updated: User) => {
    const i = users.value.findIndex((u) => u.id === updated.id);
    if (i !== -1) users.value[i] = { ...updated };
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
    updateUser,
    resetCurrentUserPassword,
    deleteMeAccount,

    filteredUsers,
  };
};
