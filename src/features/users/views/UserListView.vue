<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { User } from '../types'
import type { Role } from '@/features/roles/types'
import UserEditModal from '../components/UserEditModal.vue'
import UserCard from '../components/UserCard.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import {
  ClipboardIcon,
  PencilIcon,
  UserIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  ViewColumnsIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/vue/24/solid'
import { useUsers } from '../composables/useUsers'
import { useRoles } from '@/features/roles/composables/useRoles'

const error = ref('')

const selectedUser = ref<User | null>(null)
const isEditModalOpen = ref(false)
const copiedEmail = ref<string | null>(null)
const isCardView = ref(false)

const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email)
  copiedEmail.value = email
  setTimeout(() => (copiedEmail.value = null), 1200)
}

const page = ref(1)
const pageSize = 5

const {
  users,
  filteredUsers,
  searchQuery,
  selectedRole,
  loading,
  isMock,
  loadUsers,
  updateUser
} = useUsers()

const { loadRoles, roles } = useRoles()


const paginatedUsers = computed(() =>
  filteredUsers.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

const openEditModal = (user: User) => {
  selectedUser.value = { ...user }
  isEditModalOpen.value = true
}
 

const handleUserUpdate = (updatedUser: User) => {
  updateUser(updatedUser);
  closeEditModal()
}

const closeEditModal = () => {
  selectedUser.value = null
  isEditModalOpen.value = false
}

onMounted(() => { loadUsers(); loadRoles() })
watch([searchQuery, selectedRole], () => (page.value = 1))


const handleSwitchView = (view: 'card' | 'table') => {
  isCardView.value = (view === 'card')
}
</script>

<template>
  <CommandPalette @switchView="handleSwitchView" />

  <div class="max-w-7xl mx-auto p-8">
    <h1 class="text-4xl font-bold text-neutral-darker mb-6 flex items-center gap-2">
      <UserIcon class="w-6 h-6" /> Utilisateurs
    </h1>
    <div v-if="isMock" class="mb-4 p-4 bg-yellow-100 rounded shadow text-yellow-700 flex items-center gap-2">
      <ExclamationTriangleIcon class="w-5 h-5" />
      <span>Mode mock activé : API indisponible.</span>
    </div>

    <div class="flex gap-4 mb-6 flex-wrap">
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Recherche..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-primary"
          aria-label="Recherche d'utilisateurs"
        />
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
      </div>
      <select v-model="selectedRole"
        class="px-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-primary">
        <option value="all">
        Tous les rôles
      </option>
        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
      </select>

      <button @click="isCardView = !isCardView" class="ml-auto px-4 py-2 border rounded-lg shadow hover:bg-neutral-light transition flex items-center gap-2">
        <component :is="isCardView ? TableCellsIcon : ViewColumnsIcon" class="w-4 h-4" />
        {{ isCardView ? 'Vue tableau' : 'Vue cartes' }}
      </button>
    </div>

    <div v-if="loading" class="text-center text-neutral-dark flex items-center justify-center gap-2">
      <ClockIcon class="w-5 h-5 animate-spin" />
      Chargement...
    </div>
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
                    <ClipboardIcon class="w-4 h-4 text-white" />
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
                 <button
                  @click="openEditModal(user)"
                  class="px-3 py-1 rounded bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Modifier l'utilisateur"
                >
                  <span class="sr-only">Modifier</span>
                  <PencilIcon class="w-4 h-4" />
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
          class="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center">
          <ChevronLeftIcon class="w-4 h-4" />
        </button>

        <span class="self-center font-semibold">Page
        <input v-model="page" type="number" min="1" :max="Math.ceil(filteredUsers.length / pageSize)"
          class="w-16 text-center border rounded px-2 py-1 mx-2"
          @input="page = Math.min(Math.max(1, page), Math.ceil(filteredUsers.length / pageSize))"
          aria-label="Numéro de page"
          :value="page" />
          sur {{ Math.ceil(filteredUsers.length / pageSize) }}</span>
        <button @click="page++" :disabled="page * pageSize >= filteredUsers.length"
          class="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center">
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <UserEditModal
      :user="selectedUser"
      :roles="roles" 
      :isOpen="isEditModalOpen" 
      @close="closeEditModal" 
      @submit="handleUserUpdate"
      />
  </div>
</template>

<style scoped>
.group:hover { transform: scale(1.01); }
</style>