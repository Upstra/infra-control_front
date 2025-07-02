import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Role,
  RoleWithUsers,
  RoleCreationDto,
  RoleValidationError,
  AdminRoleCreationDto,
} from './types';
import {
  getAllRoles,
  getRoleById,
  createRole as apiCreateRole,
  createAdminRole as apiAdminCreateRole,
  updateRole as apiUpdateRole,
  deleteRole as apiDeleteRole,
  getUsersByRole,
  removeUserFromRole,
  bulkAssignUsersToRole,
  RoleApiError,
} from './api';
import { getMockRoles, getMockUsersForRole } from './mock';
import { i18n } from '@/i18n';

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([]);
  const rolesWithUsers = ref<RoleWithUsers[]>([]);
  const selectedRole = ref<RoleWithUsers | null>(null);
  const loading = ref(false);
  const userLoading = ref(false);
  const isMock = ref(false);
  const error = ref<string | null>(null);
  const validationErrors = ref<RoleValidationError[]>([]);

  const adminRoles = computed(() => roles.value.filter((role) => role.isAdmin));

  const regularRoles = computed(() =>
    roles.value.filter((role) => !role.isAdmin),
  );

  const hasAdminRole = computed(() => roles.value.some((role) => role.isAdmin));

  const fetchAllRoles = async () => {
    loading.value = true;
    isMock.value = false;
    error.value = null;
    try {
      const response = await getAllRoles();
      if (response?.data) {
        roles.value = response.data;
      }
    } catch (err: any) {
      roles.value = getMockRoles();
      isMock.value = true;
      error.value = err.message ?? i18n.global.t('roles.errors.fetch_roles');
    } finally {
      loading.value = false;
    }
  };

  const fetchRolesWithUsers = async () => {
    loading.value = true;
    isMock.value = false;
    error.value = null;
    try {
      const roleResponse = await getAllRoles();
      if (roleResponse?.data) {
        const rolesWithUserData = await Promise.all(
          roleResponse.data.map(async (role: Role) => {
            try {
              const userResponse = await getUsersByRole(role.id);
              const userData = userResponse?.data || [];
              return {
                ...role,
                users: userData,
                userCount: userData.length,
              };
            } catch {
              console.warn(
                `Failed to fetch users for role ${role.id}, using mock data`,
              );
              return {
                ...role,
                users: getMockUsersForRole(role.id),
                userCount: getMockUsersForRole(role.id).length,
              };
            }
          }),
        );
        rolesWithUsers.value = rolesWithUserData as RoleWithUsers[];
      }
    } catch (err: any) {
      rolesWithUsers.value = getMockRoles().map((role) => ({
        ...role,
        users: getMockUsersForRole(role.id),
        userCount: getMockUsersForRole(role.id).length,
      })) as RoleWithUsers[];
      isMock.value = true;
      error.value =
        err.message ?? i18n.global.t('roles.errors.fetch_roles_with_users');
    } finally {
      loading.value = false;
    }
  };

  const fetchRole = async (id: string): Promise<Role | null> => {
    try {
      const response = await getRoleById(id);
      return response?.data || null;
    } catch {
      return null;
    }
  };

  const selectRole = async (roleId: string) => {
    userLoading.value = true;
    try {
      const role = rolesWithUsers.value.find((r) => r.id === roleId);
      if (role) {
        selectedRole.value = role;
      }
    } catch (err: any) {
      error.value = err.message ?? i18n.global.t('roles.errors.select_role');
    } finally {
      userLoading.value = false;
    }
  };

  const createRoleCommon = async (
    payload: RoleCreationDto | AdminRoleCreationDto,
    apiFn: (dto: any) => Promise<any>,
  ) => {
    loading.value = true;
    clearError();

    const errors = validateRoleCreation(payload);
    if (errors.length > 0) {
      validationErrors.value = errors;
      loading.value = false;
      throw new RoleApiError(
        'VALIDATION_ERROR',
        i18n.global.t('roles.errors.validation_failed'),
        { validationErrors: errors },
      );
    }

    try {
      await apiFn(payload);
      await fetchRolesWithUsers();
    } catch (err: any) {
      handleError(err, i18n.global.t('roles.errors.creating'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRole = async (payload: RoleCreationDto) =>
    createRoleCommon(payload, apiCreateRole);

  const createAdminRole = async (payload: AdminRoleCreationDto) =>
    createRoleCommon(payload, apiAdminCreateRole);

  const updateRole = async (id: string, payload: RoleCreationDto) => {
    loading.value = true;
    clearError();

    try {
      await apiUpdateRole(id, payload);
      await fetchRolesWithUsers();
      if (selectedRole.value?.id === id) {
        await selectRole(id);
      }
    } catch (err: any) {
      handleError(err, i18n.global.t('roles.errors.updating'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRole = async (id: string) => {
    loading.value = true;
    clearError();

    try {
      await apiDeleteRole(id);
      await fetchRolesWithUsers();
      if (selectedRole.value?.id === id) {
        selectedRole.value = null;
      }
    } catch (err: any) {
      handleError(err, i18n.global.t('roles.errors.deleting'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const assignUsersToRole = async (userIds: string[], roleId: string) => {
    userLoading.value = true;
    clearError();

    try {
      await bulkAssignUsersToRole(userIds, roleId);
      await fetchRolesWithUsers();
      if (selectedRole.value?.id === roleId) {
        await selectRole(roleId);
      }
    } catch (err: any) {
      handleError(err, i18n.global.t('roles.errors.assigning'));
      throw err;
    } finally {
      userLoading.value = false;
    }
  };

  const removeUserFromRoleAction = async (userId: string) => {
    userLoading.value = true;
    clearError();

    try {
      console.log(
        `Removing user ${userId} from role ${selectedRole.value?.id}`,
      );
      await removeUserFromRole(userId, selectedRole.value?.id || '');
      console.log(`User ${userId} removed successfully`);
      await fetchRolesWithUsers();
      if (selectedRole.value) {
        await selectRole(selectedRole.value.id);
      }
    } catch (err: any) {
      handleError(err, i18n.global.t('roles.errors.removing'));
      throw err;
    } finally {
      userLoading.value = false;
    }
  };

  const handleError = (err: any, context: string) => {
    if (err instanceof RoleApiError) {
      error.value = `${context}: ${err.message}`;
      if (err.code === 'VALIDATION_ERROR' && err.details?.validationErrors) {
        validationErrors.value = err.details.validationErrors;
      }
    } else {
      error.value = `${context}: ${err.message || i18n.global.t('roles.errors.unexpected')}`;
    }
  };

  const clearError = () => {
    error.value = null;
    validationErrors.value = [];
  };

  const clearSelection = () => {
    selectedRole.value = null;
  };

  const validateRoleCreation = (
    payload: RoleCreationDto | AdminRoleCreationDto,
  ): RoleValidationError[] => {
    const errors: RoleValidationError[] = [];

    if (!payload.name?.trim()) {
      errors.push({
        field: 'name',
        message: i18n.global.t('roles.validation.required'),
        code: 'REQUIRED',
      });
    } else if (payload.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: i18n.global.t('roles.validation.min_length'),
        code: 'MIN_LENGTH',
      });
    } else if (payload.name.trim().length > 50) {
      errors.push({
        field: 'name',
        message: i18n.global.t('roles.validation.max_length'),
        code: 'MAX_LENGTH',
      });
    }

    // Check for duplicate role names
    const existingRole = roles.value.find(
      (role) => role.name.toLowerCase() === payload.name.trim().toLowerCase(),
    );
    if (existingRole) {
      errors.push({
        field: 'name',
        message: i18n.global.t('roles.validation.duplicate'),
        code: 'DUPLICATE',
      });
    }

    // Vérifier qu'il n'y a pas déjà un rôle admin (pour éviter la création d'un deuxième)
    if ('isAdmin' in payload && payload.isAdmin) {
      const existingAdminRole = roles.value.find((role) => role.isAdmin);
      if (existingAdminRole) {
        errors.push({
          field: 'isAdmin',
          message: i18n.global.t('roles.validation.admin_already_exists'),
          code: 'ADMIN_ALREADY_EXISTS',
        });
      }
    }

    return errors;
  };

  return {
    roles,
    rolesWithUsers,
    selectedRole,
    loading,
    userLoading,
    isMock,
    error,
    validationErrors,
    adminRoles,
    regularRoles,
    hasAdminRole,
    fetchAllRoles,
    fetchRolesWithUsers,
    fetchRole,
    selectRole,
    createRole,
    createAdminRole,
    updateRole,
    deleteRole,
    assignUsersToRole,
    removeUserFromRoleAction,
    clearError,
    clearSelection,
    validateRoleCreation,
    handleError,
  };
});
