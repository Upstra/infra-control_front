import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardApi } from './api'
import type { FullDashboardStatsDto } from './types'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<FullDashboardStatsDto | null>(null)
  const history = ref<Record<string, number> | null>(null)
  const loading = ref(false)

  const fetchStats = async () => {
    loading.value = true
    try {
      stats.value = await dashboardApi.getFullStats()
      return stats.value
    } finally {
      loading.value = false
    }
  }

  const fetchHistory = async (entity: string, months = 6) => {
    loading.value = true
    try {
      history.value = await dashboardApi.getHistoryStats(entity, months)
      return history.value
    } finally {
      loading.value = false
    }
  }

  return { stats, history, loading, fetchStats, fetchHistory }
})
