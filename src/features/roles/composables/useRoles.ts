import { storeToRefs } from 'pinia'
import { useRolesStore } from '../store'

export const useRoles = () => {
  const store = useRolesStore()
  const { roles, loading, isMock } = storeToRefs(store)

  const loadRoles = async () => {
    await store.fetchAllRoles()
  }

  return {
    roles,
    loading,
    isMock,
    loadRoles,
  }
}
