import type { RoleResponseDto } from './types';

export const getMockRoles = (): RoleResponseDto[] => [
  {
    id: 'admin-role-id',
    name: 'Administrator',
    isAdmin: true,
    canCreateServer: true,
    permissionServers: [],
    permissionVms: [],
  },
  {
    id: 'tech-role-id',
    name: 'Technician',
    isAdmin: false,
    canCreateServer: true,
    permissionServers: [],
    permissionVms: [],
  },
  {
    id: 'manager-role-id',
    name: 'Manager',
    isAdmin: false,
    canCreateServer: false,
    permissionServers: [],
    permissionVms: [],
  },
  {
    id: 'guest-role-id',
    name: 'Guest',
    isAdmin: false,
    canCreateServer: false,
    permissionServers: [],
    permissionVms: [],
  },
];

export const getMockUsersForRole = (roleId: string) => {
  const mockUsers = {
    'admin-role-id': [
      {
        id: '1',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@upstra.com',
        active: true,
      },
      {
        id: '2',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@upstra.com',
        active: true,
      },
    ],
    'tech-role-id': [
      {
        id: '3',
        username: 'tech1',
        firstName: 'John',
        lastName: 'Tech',
        email: 'john.tech@upstra.com',
        active: true,
      },
      {
        id: '4',
        username: 'tech2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@upstra.com',
        active: true,
      },
      {
        id: '5',
        username: 'tech3',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@upstra.com',
        active: false,
      },
    ],
    'manager-role-id': [
      {
        id: '6',
        username: 'manager1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@upstra.com',
        active: true,
      },
      {
        id: '7',
        username: 'manager2',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@upstra.com',
        active: true,
      },
    ],
    'guest-role-id': [
      {
        id: '8',
        username: 'guest1',
        firstName: 'Guest',
        lastName: 'One',
        email: 'guest1@upstra.com',
        active: true,
      },
      {
        id: '9',
        username: 'guest2',
        firstName: 'Guest',
        lastName: 'Two',
        email: 'guest2@upstra.com',
        active: false,
      },
    ],
  };

  return mockUsers[roleId as keyof typeof mockUsers] || [];
};
