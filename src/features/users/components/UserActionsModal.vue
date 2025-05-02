<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '../types'
import type { Role } from '@/features/roles/types'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  user: User | null
  isOpen: boolean
  roles: Role[]
}>()

const emit = defineEmits(['close', 'editUser', 'editRole', 'deleteUser'])

const modalRef = ref<HTMLElement | null>(null)
onClickOutside(modalRef, () => emit('close'))

const handleClose = () => emit('close')
const handleEditUser = () => emit('editUser', props.user)
const handleEditRole = () => emit('editRole', props.user)
const handleDeleteUser = () => emit('deleteUser', props.user)
</script>

<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref="modalRef" class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-neutral-darker mb-4">Actions pour {{ user?.username }}</h2>
        <div class="space-y-3">
          <button @click="handleEditUser" class="w-full px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition">Modifier l'utilisateur</button>
          <button @click="handleEditRole" class="w-full px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition">Modifier le rôle</button>
          <button v-if="user?.roleId !== 'admin-role-id'" @click="handleDeleteUser" class="w-full px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition">Supprimer</button>
          <button @click="handleClose" class="w-full px-4 py-2 rounded border text-neutral-dark hover:bg-neutral-light transition">Annuler</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
