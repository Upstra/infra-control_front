import api from '@/services/api';
import type {
  GroupResponseDto,
  PaginatedGroupResponseDto,
  GroupQueryDto,
  CreateGroupDto,
  UpdateGroupDto,
} from './types';

export const fetchGroups = async (params: GroupQueryDto = {}) => {
  const response = await api.get<PaginatedGroupResponseDto>('/groups', {
    params,
  });
  return response;
};

export const fetchGroupById = async (id: string): Promise<GroupResponseDto> => {
  const response = await api.get<GroupResponseDto>(`/groups/${id}`);
  return response.data;
};

export const createGroup = async (payload: CreateGroupDto) => {
  const response = await api.post<GroupResponseDto>('/groups', payload);
  return response.data;
};

export const updateGroup = async (id: string, payload: UpdateGroupDto) => {
  const response = await api.put<GroupResponseDto>(`/groups/${id}`, payload);
  return response.data;
};

export const deleteGroup = async (id: string) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

export const getMockGroups = (): GroupResponseDto[] => [
  {
    id: 'group-web',
    name: 'Web Servers',
    description: 'Frontend web server cluster',
    type: 'SERVER',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'group-db',
    name: 'Database Cluster',
    description: 'Primary and replica database servers',
    type: 'SERVER',
    isActive: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: 'group-vm-dev',
    name: 'Development VMs',
    description: 'Development environment virtual machines',
    type: 'VM',
    isActive: true,
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
  },
  {
    id: 'group-vm-test',
    name: 'Testing VMs',
    description: 'QA and testing virtual machines',
    type: 'VM',
    isActive: true,
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04'),
  },
];
