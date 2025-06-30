import axios from '@/services/api';
import type { UpsCreationDto, UpsUpdateDto, UpsResponseDto } from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const upsApi = {
  // GET /ups
  getAll: async (): Promise<UpsResponseDto[]> => {
    const { data } = await axios.get<UpsResponseDto[]>(
      '/ups/all',
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
