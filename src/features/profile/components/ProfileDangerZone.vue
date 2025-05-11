<script setup lang="ts">
import type { User } from '@/features/users/types'
import { TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ user: User | null }>()
const emit = defineEmits(['deleteAccount'])
</script>

<template>
  <section class="bg-red-50 rounded-xl shadow p-6 border border-red-200 space-y-4">
    <h2 class="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
      <TrashIcon class="w-5 h-5" /> Danger Zone
    </h2>
    <p class="text-sm text-red-700">Attention, cette action est irréversible.</p>
    <button
      @click="emit('deleteAccount', props.user)"
      class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 text-sm"
    >
      Supprimer mon compte
    </button>
  </section>
</template>
