<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { User } from '../types'
import type { Role } from '@/features/roles/types'
import { fetchUsers } from '../api'
import { fetchRoles } from '@/features/roles/api'
import UserEditModal from '../components/UserEditModal.vue'
import UserCard from '../components/UserCard.vue'

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const error = ref('')
const isMock = ref(false)

const selectedUser = ref<User | null>(null)
const isEditModalOpen = ref(false)
const copiedEmail = ref<string | null>(null)
const isCardView = ref(false)

const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email)
  copiedEmail.value = email
  setTimeout(() => (copiedEmail.value = null), 1200)
}

const getMockUsers = (): User[] => [
  { id: '1', username: 'admin', email: 'admin@lab.local', roleId: 'admin-role-id', firstName: 'Marie', lastName: 'Curie' },
  { id: '2', username: 'techlab', email: 'tech@lab.local', roleId: 'tech-role-id', firstName: 'Jeanne', lastName: 'Dupont' },
  { id: '3', username: 'invite', email: 'guest@lab.local', roleId: 'guest-role-id', firstName: 'Jean', lastName: 'Dupont' },
  { id: '4', username: 'ronan', email: 'ronan@lab.local', roleId: 'guest-role-id', firstName: 'Ronan', lastName: 'Le Goff' },
  { id: '5', username: 'james', email: 'james@lab.local', roleId: 'guest-role-id', firstName: 'James', lastName: 'Bond' },
  { id: '6', username: 'charles', email: 'charles@lab.local', roleId: 'guest-role-id', firstName: 'Charles', lastName: 'Darwin' },
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

const filteredUsers = computed(() =>
  users.value.filter(u =>
    (u.username + u.email).toLowerCase().includes(searchQuery.value.toLowerCase()) &&
    (selectedRole.value === 'all' || u.roleId === selectedRole.value)
  )
)

const paginatedUsers = computed(() =>
  filteredUsers.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

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

const loadRoles = async () => {
  try {
    roles.value = (await fetchRoles()).data
  } catch {
    roles.value = getMockRoles()
  }
}

const openEditModal = (user: User) => {
  selectedUser.value = { ...user }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  selectedUser.value = null
  isEditModalOpen.value = false
}

onMounted(() => { loadUsers(); loadRoles() })
watch([searchQuery, selectedRole], () => (page.value = 1))
</script>

<template>
  <div class="max-w-7xl mx-auto p-8">
    <h1 class="text-4xl font-bold text-neutral-darker mb-6">🔹 Utilisateurs</h1>

    <div v-if="isMock" class="mb-4 p-4 bg-yellow-100 rounded shadow text-yellow-700">
      ⚠️ Mode mock activé : API indisponible.
    </div>

    <div class="flex gap-4 mb-6 flex-wrap">
      <input v-model="searchQuery" type="text" placeholder="🔍 Recherche..."
        class="flex-1 px-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-primary" />

      <select v-model="selectedRole"
        class="px-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-primary">
        <option value="all">🌐 Tous les rôles</option>
        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
      </select>

      <button @click="isCardView = !isCardView"
        class="ml-auto px-4 py-2 border rounded-lg shadow hover:bg-neutral-light transition">
        {{ isCardView ? '🧾 Vue tableau' : '🧍 Vue cartes' }}
      </button>
    </div>

    <div v-if="loading" class="text-center text-neutral-dark">⏳ Chargement...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else>
      <div v-if="!isCardView">
        <table class="w-full rounded-lg overflow-hidden shadow-md bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3">Utilisateur</th>
              <th class="p-3">Email</th>
              <th class="p-3">Rôle</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id"
              class="relative transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer group">
              <td class="p-3 font-semibold">{{ user.username }}</td>
              <td class="p-3 relative" @click="copyEmail(user.email)">
                {{ user.email }}
                <transition enter-active-class="duration-300 ease-out" leave-active-class="duration-200 ease-in">
                  <span v-if="copiedEmail === user.email"
                    class="absolute inset-0 bg-black bg-opacity-70 text-white rounded flex items-center justify-center">
                    📋 Copié !
                  </span>
                </transition>
              </td>
              <td class="p-3">
                <span class="rounded-full px-2 py-1 text-sm text-white"
                  :class="user.roleId === 'admin-role-id' ? 'bg-blue-500' : 'bg-gray-500'">
                  {{ roles.find(r => r.id === user.roleId)?.name }}
                </span>
              </td>
              <td class="p-3 text-center">
                <button @click="openEditModal(user)"
                  class="px-3 py-1 rounded bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                  ✏️ Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UserCard
          v-for="user in paginatedUsers"
          :key="user.id"
          :user="user"
          :roles="roles"
          @edit="openEditModal"
        />
      </div>

      <div class="mt-6 flex justify-center gap-3">
        <button @click="page--" :disabled="page === 1"
          class="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50">⬅️</button>
        <span class="self-center font-semibold">Page {{ page }}</span>
        <button @click="page++" :disabled="page * pageSize >= filteredUsers.length"
          class="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50">➡️</button>
      </div>
    </div>

    <UserEditModal :user="selectedUser" :roles="roles" :isOpen="isEditModalOpen" @close="closeEditModal" />
  </div>
</template>

<style scoped>
.group:hover { transform: scale(1.01); }
</style>