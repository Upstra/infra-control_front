export interface Room {
  id: string;
  name: string;
  serverCount?: number;
  upsCount?: number;
}

export interface RoomCreationDto {
  name: string;
}

export interface RoomResponseDto {
  id: string;
  name: string;
  serverCount?: number;
  upsCount?: number;
}
