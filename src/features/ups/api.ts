import axios from '@/services/api';
import type {
  UpsCreationDto,
  UpsUpdateDto,
  UpsResponseDto,
  UpsListResponse,
} from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const upsApi = {
  // GET /ups
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

  // GET /ups/:id
  getById: async (id: string): Promise<UpsResponseDto> => {
    const { data } = await axios.get<UpsResponseDto>(
      `/ups/${id}`,
      getAuthHeaders(),
    );
    return data;
  },

  // POST /ups
  create: async (payload: UpsCreationDto): Promise<UpsResponseDto> => {
    const { data } = await axios.post<UpsResponseDto>(
      '/ups',
      payload,
      getAuthHeaders(),
    );
    return data;
  },

  // PATCH /ups/:id
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

  // DELETE /ups/:id
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/ups/${id}`, getAuthHeaders());
  },
};
