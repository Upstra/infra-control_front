// src/features/users/composables/useUsers.ts
import { ref, computed } from 'vue'
import type { Role } from '../types'
import { fetchRoles } from '../api'
import { getMockRoles } from '../mock'

export const useRoles = () => {
    const roles = ref<Role[]>([])
    const loading = ref(false)
    const isMock = ref(false)

    const loadRoles = async () => {
        try {
            loading.value = true
            roles.value = (await fetchRoles()).data
            isMock.value = false
        } catch {
            loading.value = false
            isMock.value = true
            roles.value = getMockRoles()

        }
    }
    return {
        roles,
        loading,
        isMock,
        loadRoles,
    }
}