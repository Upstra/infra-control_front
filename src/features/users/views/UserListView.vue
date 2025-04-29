<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { User } from '../types'

import type { Role } from '@/features/roles/types'
import { fetchUsers } from '../api'
import { fetchRoles } from '@/features/roles/api'

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const error = ref('')
const isMock = ref(false)

const getMockUsers = (): User[] => [
  {
    id: '1',
    username: 'admin',
    email: 'admin@lab.local',
    roleId: 'admin-role-id',
  },
  {
    id: '2',
    username: 'techlab',
    email: 'tech@lab.local',
    roleId: 'tech-role-id',
  },
  {
    id: '3',
    username: 'invite',
    email: 'guest@lab.local',
    roleId: 'guest-role-id',
  },
  {
    id: '4',
    username: 'ronan',
    email: 'ronan@lab.local',
    roleId: 'guest-role-id',
  },
  {
    id: '5',
    username: 'james',
    email: 'james@lab.local',
    roleId: 'guest-role-id',
  },
  {
    id: '6',
    username: 'charles',
    email: 'charles@lab.local',
    roleId: 'guest-role-id',
  },
]

const getMockRoles = (): Role[] => [
  { id: 'admin-role-id', name: 'Admin' },
  { id: 'tech-role-id', name: 'Technicien' },
  { id: 'guest-role-id', name: 'Invité' },
]

const page = ref(1)
const pageSize = 5
const searchQuery = ref('')
const selectedRole = ref('all')

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesRole =
      selectedRole.value === 'all' || user.roleId === selectedRole.value

    return matchesSearch && matchesRole
  })
})

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  isMock.value = false
  try {
    const res = await fetchUsers()
    users.value = res.data
  } catch (e) {
    console.error('Erreur API utilisateurs, fallback mock')
    users.value = getMockUsers()
    //error.value = 'Erreur de chargement des utilisateurs depuis l’API' // TODO: when API is available
    isMock.value = true
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const res = await fetchRoles()
    roles.value = res.data
  } catch (e) {
    console.error('Erreur API rôles, fallback mock')
    roles.value = getMockRoles()
  }
}
watch([searchQuery, selectedRole], () => {
  page.value = 1
})

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-neutral-darker mb-6">Utilisateurs</h1>

    <div v-if="isMock" class="mb-4 px-4 py-3 rounded bg-yellow-100 text-yellow-800">
      ⚠️ Vous visualisez des données mockées car l'API n'a pas répondu.
    </div>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par nom ou email"
        class="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <select
        v-model="selectedRole"
        class="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="all">Tous les rôles</option>
        <option v-for="role in roles" :key="role.id" :value="role.id">
          {{ role.name }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="text-center text-neutral-dark">Chargement...</div>
    <div v-else-if="error" class="text-danger text-center">{{ error }}</div>
    <div v-else>
      <table class="w-full table-auto border-collapse bg-white shadow rounded-lg">
        <thead>
          <tr class="bg-neutral-light text-left">
            <th class="p-3">Nom</th>
            <th class="p-3">Email</th>
            <th class="p-3">Rôle</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in paginatedUsers"
            :key="user.id"
            class="border-b hover:bg-neutral-light"
          >
            <td class="p-3">{{ user.username }}</td>
            <td class="p-3">{{ user.email }}</td>
            <td class="p-3">
              <span
                class="inline-block px-3 py-1 text-sm rounded-full text-white"
                :class="{
                  'bg-primary': user.roleId === 'admin-role-id',
                  'bg-gray-500': user.roleId !== 'admin-role-id'
                }"
              >
                {{ roles.find(r => r.id === user.roleId)?.name || 'Inconnu' }}
              </span>
            </td>
            <td class="p-3 text-center">
              <button class="text-primary hover:underline text-sm">Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="filteredUsers.length > pageSize"
        class="flex justify-center items-center space-x-4 mt-6"
      >
        <button
          @click="page--"
          :disabled="page === 1"
          class="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-neutral-light"
        >
          Précédent
        </button>
        <span class="text-sm">
          Page {{ page }} / {{ Math.ceil(filteredUsers.length / pageSize) }}
        </span>
        <button
          @click="page++"
          :disabled="page >= Math.ceil(filteredUsers.length / pageSize)"
          class="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-neutral-light"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>