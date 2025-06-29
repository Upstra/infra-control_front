import api from '@/services/api'
import type { HistoryListResponseDto, HistoryFilter } from './types'

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})

export const historyApi = {
  getList: async (
    page = 1,
    limit = 10,
    filters: HistoryFilter = {}
  ): Promise<HistoryListResponseDto> => {
    const { data } = await api.get<HistoryListResponseDto>('/history', {
      params: { page, limit, ...filters },
      ...getAuthHeaders(),
    })
    return data
  },
}
