import api from "@/services/api";
import type { RoomCreationDto, RoomResponseDto } from "./types";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const roomApi = {
  fetchRooms: (): Promise<RoomResponseDto[]> => {
    return api.get("/room", getAuthHeaders()).then((res) => res.data);
  },
  fetchRoomById: (id: string): Promise<RoomResponseDto> => {
    return api.get(`/room/${id}`, getAuthHeaders()).then((res) => res.data);
  },
  createRoom: async (payload: RoomCreationDto): Promise<RoomResponseDto> => {
    const room = await api.post("/room", payload, getAuthHeaders());
    return room.data;
  },
  updateRoom: (
    id: string,
    payload: RoomCreationDto
  ): Promise<RoomResponseDto> => {
    return api
      .patch(`/room/${id}`, payload, getAuthHeaders())
      .then((res) => res.data);
  },
  deleteRoom: (id: string): Promise<void> => {
    return api.delete(`/room/${id}`, getAuthHeaders()).then((res) => res.data);
  },
};
