import { ref, computed } from 'vue'
import type { User } from '../types'
import { fetchUsers } from '../api'
import { getMockUsers } from '../mock'

export const useUsers = () => {
    const users = ref<User[]>([])
    const loading = ref(true)
    const error = ref('')
    const isMock = ref(false)

    const searchQuery = ref('')
    const selectedRole = ref('all')


    const loadUsers = async () => {
        loading.value = true
        try {
            users.value = (await fetchUsers()).data
        } catch {
            users.value = getMockUsers()
            isMock.value = true
        } finally {
            loading.value = false
        }
    }

    const updateUser = (updatedUser: User) => {
        const index = users.value.findIndex(u => u.id === updatedUser.id)
        if (index !== -1) {
            users.value[index] = { ...updatedUser }
        }
    }

    const filteredUsers = computed(() =>
        users.value.filter(u =>
            (u.username + u.email).toLowerCase().includes(searchQuery.value.toLowerCase()) &&
            (selectedRole.value === 'all' || u.roleId === selectedRole.value)
        )
    )

    return {
        users,
        loading,
        isMock,
        loadUsers,
        updateUser,
        filteredUsers,
        searchQuery,
        selectedRole,
    }
}