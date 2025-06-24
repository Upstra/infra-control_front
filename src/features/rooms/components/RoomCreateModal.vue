<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div ref="modalRef" class="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
        <button class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-darker" @click="$emit('close')">
          <XMarkIcon class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-bold text-neutral-darker mb-4">Ajouter une salle</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Nom
              <input v-model="form.name" type="text" class="input" required />
            </label>
          </div>
          <div class="flex justify-end pt-2">
            <button type="submit" :disabled="isSubmitting" class="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              {{ isSubmitting ? 'Création...' : 'Créer la salle' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { roomApi } from '../api'
import type { RoomCreationDto } from '../types'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'created'])

const form = ref<RoomCreationDto>({ name: '' })
const modalRef = ref<HTMLElement | null>(null)
const isSubmitting = ref(false)

onClickOutside(modalRef, () => emit('close'))

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await roomApi.createRoom(form.value)
    emit('created')
    emit('close')
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.input {
  @apply w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>
