import { defineStore } from 'pinia'
import { ref } from 'vue'
import { roomApi } from './api'
import type { RoomResponseDto, RoomCreationDto } from './types'

export const useRoomStore = defineStore('rooms', () => {
  const list = ref<RoomResponseDto[]>([])
  const current = ref<RoomResponseDto | null>(null)
  const loading = ref(false)

  const fetchRooms = async () => {
    loading.value = true
    try {
      list.value = await roomApi.fetchRooms()
    } finally {
      loading.value = false
    }
  }

  const fetchRoomById = async (id: string) => {
    loading.value = true
    try {
      current.value = await roomApi.fetchRoomById(id)
      return current.value
    } finally {
      loading.value = false
    }
  }

  const createRoom = async (payload: RoomCreationDto) => {
    const created = await roomApi.createRoom(payload)
    await fetchRooms()
    return created
  }

  const updateRoom = async (id: string, payload: RoomCreationDto) => {
    const updated = await roomApi.updateRoom(id, payload)
    await fetchRooms()
    return updated
  }

  const deleteRoom = async (id: string) => {
    await roomApi.deleteRoom(id)
    list.value = list.value.filter((r) => r.id !== id)
  }

  return {
    list,
    current,
    loading,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
  }
})
