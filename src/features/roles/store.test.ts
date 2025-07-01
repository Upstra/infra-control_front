import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRolesStore } from './store';
import * as api from './api';
import type { RoleResponseDto, RoleCreationDto } from './types';

// Mock API functions
vi.mock('./api', () => ({
  getAllRoles: vi.fn(),
  getRoleById: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  getUsersByRole: vi.fn(),
  assignUserToRole: vi.fn(),
  removeUserFromRole: vi.fn(),
  bulkAssignUsersToRole: vi.fn(),
  RoleApiError: class RoleApiError extends Error {
    constructor(
      public code: string,
      message: string,
      public details?: Record<string, any>,
    ) {
      super(message);
      this.name = 'RoleApiError';
    }
  },
}));

// Mock data
const mockRoles: RoleResponseDto[] = [
  {
    id: '1',
    name: 'Administrator',
    isAdmin: true,
    canCreateServer: true,
    permissionServers: [],
    permissionVms: [],
  },
  {
    id: '2',
    name: 'Technician',
    isAdmin: false,
    canCreateServer: true,
    permissionServers: [],
    permissionVms: [],
  },
];

const mockUsers = [
  {
    id: '1',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    active: true,
  },
  {
    id: '2',
    username: 'tech',
    firstName: 'Tech',
    lastName: 'User',
    email: 'tech@test.com',
    active: true,
  },
];

const createMockAxiosResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('useRolesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAllRoles', () => {
    it('should fetch roles successfully', async () => {
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      mockedGetAllRoles.mockResolvedValue(createMockAxiosResponse(mockRoles));

      const store = useRolesStore();
      await store.fetchAllRoles();

      expect(store.roles).toEqual(mockRoles);
      expect(store.loading).toBe(false);
      expect(store.isMock).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should handle API error and fallback to mock data', async () => {
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      mockedGetAllRoles.mockRejectedValue(new Error('API Error'));

      const store = useRolesStore();
      await store.fetchAllRoles();

      expect(store.loading).toBe(false);
      expect(store.isMock).toBe(true);
      expect(store.error).toBe('API Error');
      expect(store.roles.length).toBeGreaterThan(0);
    });
  });

  describe('fetchRolesWithUsers', () => {
    it('should fetch roles with user data', async () => {
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      mockedGetAllRoles.mockResolvedValue(createMockAxiosResponse(mockRoles));
      mockedGetUsersByRole.mockResolvedValue(
        createMockAxiosResponse(mockUsers),
      );

      const store = useRolesStore();
      await store.fetchRolesWithUsers();

      expect(store.rolesWithUsers).toHaveLength(2);
      expect(store.rolesWithUsers[0].users).toEqual(mockUsers);
      expect(store.rolesWithUsers[0].userCount).toBe(2);
    });

    it('should handle getUsersByRole failure with mock data', async () => {
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      mockedGetAllRoles.mockResolvedValue(createMockAxiosResponse(mockRoles));
      mockedGetUsersByRole.mockRejectedValue(new Error('Users API Error'));

      const store = useRolesStore();
      await store.fetchRolesWithUsers();

      expect(store.rolesWithUsers).toHaveLength(2);
      expect(store.rolesWithUsers[0].users).toBeDefined();
    });
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const mockedCreateRole = vi.mocked(api.createRole);
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      const newRole: RoleCreationDto = { name: 'New Role' };
      const createdRole: RoleResponseDto = {
        id: '3',
        name: 'New Role',
        isAdmin: false,
        canCreateServer: false,
        permissionServers: [],
        permissionVms: [],
      };

      mockedCreateRole.mockResolvedValue(createMockAxiosResponse(createdRole));
      mockedGetAllRoles.mockResolvedValue(
        createMockAxiosResponse([...mockRoles, createdRole]),
      );
      mockedGetUsersByRole.mockResolvedValue(createMockAxiosResponse([]));

      const store = useRolesStore();
      await store.createRole(newRole);

      expect(mockedCreateRole).toHaveBeenCalledWith(newRole);
      expect(store.rolesWithUsers).toHaveLength(3);
    });

    it('should handle create role error', async () => {
      const mockedCreateRole = vi.mocked(api.createRole);
      const { RoleApiError } = await import('./api');
      mockedCreateRole.mockRejectedValue(
        new RoleApiError('CREATE_FAILED', 'Create failed'),
      );

      const store = useRolesStore();
      const newRole: RoleCreationDto = { name: 'New Role' };

      await expect(store.createRole(newRole)).rejects.toThrow('Create failed');
      expect(store.error).toContain('Error creating role');
    });
  });

  describe('updateRole', () => {
    it('should update a role successfully', async () => {
      const mockedUpdateRole = vi.mocked(api.updateRole);
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      const updateData: RoleCreationDto = { name: 'Updated Role' };
      const updatedRole: RoleResponseDto = {
        ...mockRoles[0],
        name: 'Updated Role',
      };

      mockedUpdateRole.mockResolvedValue(createMockAxiosResponse(updatedRole));
      mockedGetAllRoles.mockResolvedValue(
        createMockAxiosResponse([updatedRole, mockRoles[1]]),
      );
      mockedGetUsersByRole.mockResolvedValue(createMockAxiosResponse([]));

      const store = useRolesStore();
      await store.updateRole('1', updateData);

      expect(mockedUpdateRole).toHaveBeenCalledWith('1', updateData);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role successfully', async () => {
      const mockedDeleteRole = vi.mocked(api.deleteRole);
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      mockedDeleteRole.mockResolvedValue(createMockAxiosResponse({}));
      mockedGetAllRoles.mockResolvedValue(
        createMockAxiosResponse([mockRoles[1]]),
      );
      mockedGetUsersByRole.mockResolvedValue(createMockAxiosResponse([]));

      const store = useRolesStore();
      store.selectedRole = {
        ...mockRoles[0],
        users: [],
        userCount: 0,
      };

      await store.deleteRole('1');

      expect(mockedDeleteRole).toHaveBeenCalledWith('1');
      expect(store.selectedRole).toBe(null);
    });
  });

  describe('selectRole', () => {
    it('should select a role from rolesWithUsers', async () => {
      const store = useRolesStore();
      store.rolesWithUsers = mockRoles.map((role) => ({
        ...role,
        users: mockUsers,
        userCount: mockUsers.length,
      }));

      await store.selectRole('1');

      expect(store.selectedRole?.id).toBe('1');
      expect(store.selectedRole?.name).toBe('Administrator');
    });
  });

  describe('assignUsersToRole', () => {
    it('should assign users to role successfully', async () => {
      const mockedBulkAssignUsersToRole = vi.mocked(api.bulkAssignUsersToRole);
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      mockedBulkAssignUsersToRole.mockResolvedValue([]);
      mockedGetAllRoles.mockResolvedValue(createMockAxiosResponse(mockRoles));
      mockedGetUsersByRole.mockResolvedValue(createMockAxiosResponse([]));

      const store = useRolesStore();
      await store.assignUsersToRole(['1', '2'], 'role-1');

      expect(mockedBulkAssignUsersToRole).toHaveBeenCalledWith(
        ['1', '2'],
        'role-1',
      );
    });
  });

  describe('removeUserFromRoleAction', () => {
    it('should remove user from role successfully', async () => {
      const mockedRemoveUserFromRole = vi.mocked(api.removeUserFromRole);
      const mockedGetAllRoles = vi.mocked(api.getAllRoles);
      const mockedGetUsersByRole = vi.mocked(api.getUsersByRole);

      mockedRemoveUserFromRole.mockResolvedValue(createMockAxiosResponse({}));
      mockedGetAllRoles.mockResolvedValue(createMockAxiosResponse(mockRoles));
      mockedGetUsersByRole.mockResolvedValue(createMockAxiosResponse([]));

      const store = useRolesStore();
      await store.removeUserFromRoleAction('user-1');

      expect(mockedRemoveUserFromRole).toHaveBeenCalledWith('user-1');
    });
  });

  describe('computed properties', () => {
    it('should filter admin roles correctly', () => {
      const store = useRolesStore();
      store.roles = mockRoles;

      expect(store.adminRoles).toHaveLength(1);
      expect(store.adminRoles[0].name).toBe('Administrator');
    });

    it('should filter regular roles correctly', () => {
      const store = useRolesStore();
      store.roles = mockRoles;

      expect(store.regularRoles).toHaveLength(1);
      expect(store.regularRoles[0].name).toBe('Technician');
    });
  });

  describe('utility methods', () => {
    it('should clear error', () => {
      const store = useRolesStore();
      store.error = 'Some error';

      store.clearError();

      expect(store.error).toBe(null);
    });

    it('should clear selection', () => {
      const store = useRolesStore();
      store.selectedRole = {
        ...mockRoles[0],
        users: [],
        userCount: 0,
      };

      store.clearSelection();

      expect(store.selectedRole).toBe(null);
    });
  });

  describe('validation', () => {
    it('should validate role creation with empty name', () => {
      const store = useRolesStore();
      const errors = store.validateRoleCreation({ name: '' });

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('REQUIRED');
    });

    it('should validate role creation with short name', () => {
      const store = useRolesStore();
      const errors = store.validateRoleCreation({ name: 'A' });

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('MIN_LENGTH');
    });

    it('should validate role creation with valid name', () => {
      const store = useRolesStore();
      const errors = store.validateRoleCreation({ name: 'Valid Role Name' });

      expect(errors).toHaveLength(0);
    });
  });
});
