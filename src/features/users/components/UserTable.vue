<script setup lang="ts">
import type { User } from '../types'
import { ClipboardIcon, PencilIcon } from '@heroicons/vue/24/solid'
import type { Role } from '@/features/roles/types'

const { users, roles, copiedEmail } = defineProps<{
  users: User[]
  roles: Role[]
  copiedEmail: string | null
}>()

const emit = defineEmits<{
  (e: 'copyEmail', email: string): void
  (e: 'edit', user: User): void
}>()
</script>

<template>
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
      <tr
        v-for="user in users"
        :key="user.id"
        class="relative transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
      >
        <td class="p-3 font-semibold">{{ user.username }}</td>
        <td class="p-3 relative" @click="emit('copyEmail', user.email)">
          {{ user.email }}
          <transition enter-active-class="duration-300 ease-out" leave-active-class="duration-200 ease-in">
            <span
              v-if="copiedEmail === user.email"
              class="absolute inset-0 bg-black bg-opacity-70 text-white rounded flex items-center justify-center"
            >
              <ClipboardIcon class="w-4 h-4 text-white" />
            </span>
          </transition>
        </td>
        <td class="p-3">
          <span
            class="rounded-full px-2 py-1 text-sm text-white"
            :class="user.roleId === 'admin-role-id' ? 'bg-blue-500' : 'bg-gray-500'"
          >
            {{ roles.find((r) => r.id === user.roleId)?.name }}
          </span>
        </td>
        <td class="p-3 text-center">
          <button
            @click="emit('edit', user)"
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
</template>