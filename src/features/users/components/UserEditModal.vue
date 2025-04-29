<script setup lang="ts">
import { computed, watch } from 'vue'
import type { User } from '../types'
import type { Role } from '@/features/roles/types'

const props = defineProps<{
  user: User | null
  roles: Role[]
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'submit', 'update:user'])

const localUser = computed({
  get: () => ({ ...props.user }),
  set: (val) => emit('update:user', val)
})

watch(() => props.user, (newUser) => {
  if (newUser) Object.assign(localUser.value, newUser)
})

const submitForm = () => {
  emit('submit', localUser.value)
}
</script>

<template>
  <div v-if="isOpen && user" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-neutral-dark hover:text-danger"
      >
        ✕
      </button>

      <h2 class="text-xl font-semibold text-neutral-darker mb-4">Modifier l'utilisateur</h2>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-neutral-dark text-sm font-medium mb-1">Nom d'utilisateur</label>
          <input v-model="localUser.username" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label class="block text-neutral-dark text-sm font-medium mb-1">Prénom</label>
          <input v-model="localUser.firstName" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label class="block text-neutral-dark text-sm font-medium mb-1">Nom de famille</label>
          <input v-model="localUser.lastName" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label class="block text-neutral-dark text-sm font-medium mb-1">Email</label>
          <input v-model="localUser.email" type="email" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label class="block text-neutral-dark text-sm font-medium mb-1">Rôle</label>
          <select v-model="localUser.roleId" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border rounded-lg bg-neutral-light hover:bg-neutral-dark text-neutral-darker hover:text-white">
            Annuler
          </button>
          <button type="submit"
            class="px-4 py-2 border rounded-lg bg-primary text-white hover:bg-primary-dark">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>