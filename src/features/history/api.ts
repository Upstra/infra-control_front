import api from '@/services/api'
import type { HistoryListResponseDto, HistoryFilter } from './types'

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})

const sanitizeFilters = (filters: HistoryFilter) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  )
}

export const historyApi = {
  getList: async (
    page = 1,
    limit = 10,
    filters: HistoryFilter = {}
  ): Promise<HistoryListResponseDto> => {
    const params = { page, limit, ...sanitizeFilters(filters) }
    const { data } = await api.get<HistoryListResponseDto>('/history', {
      params,
      ...getAuthHeaders(),
    })
    return data
  },
}
