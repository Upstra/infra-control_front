import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/services/api'
import { historyApi } from '../api'
import { HistoryEntity, HistoryAction } from '../types'

vi.mock('@/services/api', () => ({
  default: { get: vi.fn() },
}))
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> }

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  mockedAxios.get.mockReset()
  localStorage.clear()
})

describe('historyApi.getList', () => {
  it('calls endpoint with params and token', async () => {
    mockedAxios.get.mockResolvedValue({ data: { items: [] } })
    localStorage.setItem('token', 'abc')
    await historyApi.getList(2, 5)
    expect(mockedAxios.get).toHaveBeenCalledWith('/history', {
      params: { page: 2, limit: 5 },
      headers: { Authorization: 'Bearer abc' },
    })
  })

  it('supports filters', async () => {
    mockedAxios.get.mockResolvedValue({ data: { items: [] } })
    await historyApi.getList(1, 10, {
      entity: HistoryEntity.Server,
      action: HistoryAction.Create,
      userId: 'u1',
      from: '2024-01-01',
      to: '2024-02-01',
    })
    expect(mockedAxios.get).toHaveBeenCalledWith('/history', {
      params: {
        page: 1,
        limit: 10,
        entity: 'server',
        action: 'CREATE',
        userId: 'u1',
        from: '2024-01-01',
        to: '2024-02-01',
      },
      headers: { Authorization: 'Bearer null' },
    })
  })

  it('uses defaults when no params', async () => {
    mockedAxios.get.mockResolvedValue({ data: { items: [] } })
    await historyApi.getList()
    expect(mockedAxios.get).toHaveBeenCalledWith('/history', {
      params: { page: 1, limit: 10 },
      headers: { Authorization: 'Bearer null' },
    })
  })
})
