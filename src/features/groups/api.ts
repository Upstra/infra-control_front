import api from '@/services/api';
import type {
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  GroupListResponse,
  GroupListParams,
  ServerGroup,
  VmGroup,
} from './types';

export const getMockServerGroups = (): ServerGroup[] => [
  {
    id: 'group-web',
    name: 'Web Servers',
    description: 'Frontend web server cluster',
    type: 'server',
    priority: 1,
    cascade: true,
    serverIds: ['1', '4', '5'],
    roomId: 'room-1',
  },
  {
    id: 'group-db',
    name: 'Database Cluster',
    description: 'Primary and replica database servers',
    type: 'server',
    priority: 1,
    cascade: false,
    serverIds: ['2', '6'],
    roomId: 'room-1',
  },
  {
    id: 'group-app',
    name: 'Application Servers',
    description: 'Application server pool',
    type: 'server',
    priority: 2,
    cascade: true,
    serverIds: ['3', '7', '8'],
    roomId: 'room-2',
  },
];

export const getMockVmGroups = (): VmGroup[] => [
  {
    id: 'group-vm-dev',
    name: 'Development VMs',
    description: 'Development environment virtual machines',
    type: 'vm',
    priority: 3,
    cascade: true,
    vmIds: ['vm-1', 'vm-2', 'vm-3'],
    roomId: 'room-2',
  },
  {
    id: 'group-vm-test',
    name: 'Testing VMs',
    description: 'QA and testing virtual machines',
    type: 'vm',
    priority: 4,
    cascade: true,
    vmIds: ['vm-4', 'vm-5'],
    roomId: 'room-2',
  },
];

export const getMockGroups = (): Group[] => [
  ...getMockServerGroups(),
  ...getMockVmGroups(),
];

export const getMockGroupListResponse = (
  params: GroupListParams = {},
): GroupListResponse => {
  const { page = 1, limit = 10, type, roomId } = params;
  
  let allGroups = getMockGroups();
  
  if (type) {
    allGroups = allGroups.filter(group => group.type === type);
  }
  
  if (roomId) {
    allGroups = allGroups.filter(group => group.roomId === roomId);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = allGroups.slice(startIndex, endIndex);

  return {
    items,
    totalItems: allGroups.length,
    totalPages: Math.ceil(allGroups.length / limit),
    currentPage: page,
  };
};

export const fetchServerGroups = (params: GroupListParams = {}) => {
  return api.get<GroupListResponse>('/groups/servers', { params });
};

export const fetchVmGroups = (params: GroupListParams = {}) => {
  return api.get<GroupListResponse>('/groups/vms', { params });
};

export const fetchGroups = (params: GroupListParams = {}) => {
  return api.get<GroupListResponse>('/groups', { params });
};

export const fetchGroupById = async (id: string): Promise<Group> => {
  try {
    const response = await api.get<Group>(`/groups/${id}`);
    return response.data;
  } catch {
    const mockGroups = getMockGroups();
    const mockGroup = mockGroups.find((g) => g.id === id);
    if (!mockGroup) {
      throw new Error(`Group with id ${id} not found`);
    }
    return mockGroup;
  }
};

export const createGroup = async (payload: CreateGroupPayload) => {
  const response = await api.post<Group>('/groups', payload);
  return response.data;
};

export const updateGroup = async (id: string, payload: UpdateGroupPayload) => {
  const response = await api.put<Group>(`/groups/${id}`, payload);
  return response.data;
};

export const deleteGroup = async (id: string) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

export const addResourcesToGroup = async (id: string, resourceIds: string[]) => {
  const response = await api.post<Group>(`/groups/${id}/resources`, { resourceIds });
  return response.data;
};

export const removeResourcesFromGroup = async (id: string, resourceIds: string[]) => {
  const response = await api.delete<Group>(`/groups/${id}/resources`, {
    data: { resourceIds },
  });
  return response.data;
};
