import axios from '@/services/api';
import type {
  UpsCreationDto,
  UpsUpdateDto,
  UpsResponseDto,
  UpsListResponse,
  BatteryStatus,
} from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const upsApi = {
  getAllPaginated: async (
    page: number,
    limit: number,
    searchQuery?: string,
  ): Promise<UpsListResponse> => {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    const { data } = await axios.get<UpsListResponse>('/ups', {
      params,
      ...getAuthHeaders(),
    });
    return data;
  },

  getAllAdmin: async (): Promise<UpsResponseDto[]> => {
    const { data } = await axios.get<UpsResponseDto[]>(
      '/ups/admin/all',
      getAuthHeaders(),
    );
    return data;
  },

  getById: async (id: string): Promise<UpsResponseDto> => {
    const { data } = await axios.get<UpsResponseDto>(
      `/ups/${id}`,
      getAuthHeaders(),
    );
    return data;
  },

  create: async (payload: UpsCreationDto): Promise<UpsResponseDto> => {
    const { data } = await axios.post<UpsResponseDto>(
      '/ups',
      payload,
      getAuthHeaders(),
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpsUpdateDto,
  ): Promise<UpsResponseDto> => {
    const { data } = await axios.patch<UpsResponseDto>(
      `/ups/${id}`,
      payload,
      getAuthHeaders(),
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`/ups/${id}`, getAuthHeaders());
  },

  ping: async (id: string, payload?: { ip?: string }) => {
    const { data } = await axios.post(
      `/ups/${id}/ping`,
      payload || {},
      getAuthHeaders(),
    );
    return data;
  },

  getBatteryStatus: async (
    page: number = 1,
    limit: number = 10,
    forceRefresh: boolean = false,
  ) => {
    const { data } = await axios.get('/ups/battery/status', {
      params: { page, limit, forceRefresh },
      ...getAuthHeaders(),
    });
    return data;
  },

  getBatteryStatusForUps: async (upsId: string) => {
    const { data } = await axios.get<BatteryStatus>(
      `/ups/battery/${upsId}`,
      getAuthHeaders(),
    );
    return data;
  },
};

export const pingUpsByIp = async (ip: string) => {
  const response = await axios.get(`/ping/hostname/${ip}`);
  return response.data;
};
