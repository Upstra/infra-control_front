<script setup lang="ts">
import { MagnifyingGlassIcon, ExclamationTriangleIcon, TableCellsIcon, ViewColumnsIcon } from '@heroicons/vue/24/solid'
import type { Role } from '@/features/roles/types'

defineProps<{
  roles: Role[]
  isMock: boolean
  isCardView: boolean
  search: string
  role: string
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:role', value: string): void
  (e: 'toggle-view', view: 'card' | 'table'): void
}>()
</script>

<template>
  <div>
    <div v-if="isMock" class="mb-4 p-4 bg-yellow-100 rounded shadow text-yellow-700 flex items-center gap-2">
      <ExclamationTriangleIcon class="w-5 h-5" />
      <span>Mode mock activé : API indisponible.</span>
    </div>
    <div class="flex gap-4 mb-6 flex-wrap">
      <div class="relative flex-1">
        <input
          :value="search"
          @input="event => emit('update:search', (event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Recherche..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-primary"
          aria-label="Recherche d'utilisateurs"
        />
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
      </div>
      <select
        :value="role"
        @change="event => emit('update:role', (event.target as HTMLSelectElement).value)"
        class="px-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-primary"
      >
        <option value="all">Tous les rôles</option>
        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
      </select>

      <button
        @click="emit('toggle-view', isCardView ? 'table' : 'card')"
        class="ml-auto px-4 py-2 border rounded-lg shadow hover:bg-neutral-light transition flex items-center gap-2"
      >
        <component :is="isCardView ? TableCellsIcon : ViewColumnsIcon" class="w-4 h-4" />
        {{ isCardView ? 'Vue tableau' : 'Vue cartes' }}
      </button>
    </div>
  </div>
</template>