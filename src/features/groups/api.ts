import api from '@/services/api';
import type {
  GroupServerResponseDto,
  GroupVmResponseDto,
  GroupServerListResponseDto,
  GroupVmListResponseDto,
  ShutdownPreviewListResponseDto,
  ShutdownRequestDto,
  ServerGroupListParams,
  VmGroupListParams,
  ShutdownPreviewParams,
  CreateGroupPayload,
  UpdateGroupPayload,
} from './types';

export const fetchServerGroups = async (params: ServerGroupListParams = {}) => {
  const response = await api.get<GroupServerListResponseDto>('/group/server', {
    params,
  });
  if (response.data && response.data.items) {
    response.data.items = response.data.items.map((item) => ({
      ...item,
      type: 'server' as const,
    }));
  }
  return response;
};

export const fetchVmGroups = async (params: VmGroupListParams = {}) => {
  const response = await api.get<GroupVmListResponseDto>('/group/vm', {
    params,
  });
  if (response.data && response.data.items) {
    response.data.items = response.data.items.map((item) => ({
      ...item,
      type: 'vm' as const,
    }));
  }
  return response;
};

export const previewShutdown = (
  payload: ShutdownRequestDto,
  params: ShutdownPreviewParams = {},
) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const url = `/group/shutdown/preview${queryParams.toString() ? `?${queryParams}` : ''}`;
  return api.post<ShutdownPreviewListResponseDto>(url, payload);
};

export const executeShutdown = (
  payload: ShutdownRequestDto,
  params: ShutdownPreviewParams = {},
) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const url = `/group/shutdown/execute${queryParams.toString() ? `?${queryParams}` : ''}`;
  return api.post<ShutdownPreviewListResponseDto>(url, payload);
};

export const fetchGroupById = async (
  id: string,
  type: 'server' | 'vm',
): Promise<GroupServerResponseDto | GroupVmResponseDto> => {
  const endpoint =
    type === 'server' ? `/group/server/${id}` : `/group/vm/${id}`;
  const response = await api.get<GroupServerResponseDto | GroupVmResponseDto>(
    endpoint,
  );
  return { ...response.data, type } as
    | GroupServerResponseDto
    | GroupVmResponseDto;
};

export const createGroup = async (payload: CreateGroupPayload) => {
  const { type, resourceIds, serverGroupId, roomId, ...apiPayload } = payload;
  const endpoint = type === 'server' ? '/group/server' : '/group/vm';

  const basePayload = roomId ? { ...apiPayload, roomId } : apiPayload;

  const requestPayload =
    type === 'server'
      ? { ...basePayload, serverIds: resourceIds }
      : serverGroupId && serverGroupId !== ''
        ? { ...basePayload, serverGroupId, vmIds: resourceIds }
        : { ...basePayload, vmIds: resourceIds };

  const response = await api.post<GroupServerResponseDto | GroupVmResponseDto>(
    endpoint,
    requestPayload,
  );
  return { ...response.data, type } as
    | GroupServerResponseDto
    | GroupVmResponseDto;
};

export const updateGroup = async (id: string, payload: UpdateGroupPayload) => {
  const { type, resourceIds, roomId, ...apiPayload } = payload;
  const endpoint =
    type === 'server' ? `/group/server/${id}` : `/group/vm/${id}`;

  const basePayload = roomId ? { ...apiPayload, roomId } : apiPayload;

  const requestPayload = resourceIds
    ? type === 'server'
      ? { ...basePayload, serverIds: resourceIds }
      : { ...basePayload, vmIds: resourceIds }
    : basePayload;

  const response = await api.patch<GroupServerResponseDto | GroupVmResponseDto>(
    endpoint,
    requestPayload,
  );
  return { ...response.data, type } as
    | GroupServerResponseDto
    | GroupVmResponseDto;
};

export const deleteGroup = async (id: string, type: 'server' | 'vm') => {
  const endpoint =
    type === 'server' ? `/group/server/${id}` : `/group/vm/${id}`;
  const response = await api.delete(endpoint);
  return response.data;
};

export const toggleGroupCascade = async (id: string, cascade: boolean) => {
  const response = await api.patch<GroupServerResponseDto>(
    `/group/server/${id}/cascade`,
    { cascade },
  );
  return {
    ...response.data,
    type: 'server' as const,
  } as GroupServerResponseDto;
};

export const getMockGroups = (): (
  | GroupServerResponseDto
  | GroupVmResponseDto
)[] => [
  {
    id: 'group-web',
    name: 'Web Servers',
    description: 'Frontend web server cluster',
    type: 'server',
    priority: 10,
    cascade: true,
    serverIds: ['1', '4', '5'],
    vmGroupIds: [],
    roomId: 'room-1',
  },
  {
    id: 'group-db',
    name: 'Database Cluster',
    description: 'Primary and replica database servers',
    type: 'server',
    priority: 8,
    cascade: false,
    serverIds: ['2', '6'],
    vmGroupIds: [],
    roomId: 'room-1',
  },
  {
    id: 'group-vm-dev',
    name: 'Development VMs',
    description: 'Development environment virtual machines',
    type: 'vm',
    priority: 5,
    cascade: true,
    vmIds: ['vm-1', 'vm-2', 'vm-3'],
    serverGroupId: 'group-web',
    roomId: 'room-2',
  },
  {
    id: 'group-vm-test',
    name: 'Testing VMs',
    description: 'QA and testing virtual machines',
    type: 'vm',
    priority: 3,
    cascade: true,
    vmIds: ['vm-4', 'vm-5'],
    serverGroupId: 'group-db',
    roomId: 'room-2',
  },
];
