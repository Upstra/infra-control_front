import api from '@/services/api';
import type {
  RoomCreationDto,
  RoomResponseDto,
  RoomListResponse,
} from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const roomApi = {
  fetchRooms: (
    includeCounts = false,
    page = 1,
    limit = 10,
  ): Promise<RoomListResponse> => {
    const params = new URLSearchParams();
    if (includeCounts) params.append('includeCounts', 'true');
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `/room?${params.toString()}`;
    return api.get(url, getAuthHeaders()).then((res) => res.data);
  },
  fetchRoomById: (id: string): Promise<RoomResponseDto> => {
    return api.get(`/room/${id}`, getAuthHeaders()).then((res) => res.data);
  },
  createRoom: async (payload: RoomCreationDto): Promise<RoomResponseDto> => {
    const room = await api.post('/room', payload, getAuthHeaders());
    return room.data;
  },
  updateRoom: (
    id: string,
    payload: RoomCreationDto,
  ): Promise<RoomResponseDto> => {
    return api
      .patch(`/room/${id}`, payload, getAuthHeaders())
      .then((res) => res.data);
  },
  deleteRoom: (id: string): Promise<void> => {
    return api.delete(`/room/${id}`, getAuthHeaders()).then((res) => res.data);
  },
};
