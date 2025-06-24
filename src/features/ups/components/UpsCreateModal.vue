<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div ref="modalRef" class="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
        <button class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-darker" @click="$emit('close')">
          <XMarkIcon class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-bold text-neutral-darker mb-4">Ajouter un onduleur</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Nom
              <input v-model="form.name" type="text" class="input" required />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium">IP
              <input v-model="form.ip" type="text" class="input" required />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium">Login
              <input v-model="form.login" type="text" class="input" required />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium">Mot de passe
              <input v-model="form.password" type="password" class="input" required />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium">Salle
              <select v-model="form.roomId" class="input" required>
                <option value="" disabled>Sélectionner une salle</option>
                <option
                  v-for="room in rooms"
                  :key="room.id"
                  :value="room.id"
                >
                  {{ room.name }}
                </option>
              </select>
              <div
                v-if="selectedRoom"
                class="mt-2 p-3 border rounded-lg bg-neutral-50 text-sm"
              >
                <p><strong>Nom :</strong> {{ selectedRoom.name }}</p>
                <p><strong>ID :</strong> {{ selectedRoom.id }}</p>
              </div>
            </label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">Délai démarrage (s)
                <input v-model.number="form.grace_period_on" type="number" min="0" class="input" />
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium">Délai arrêt (s)
                <input v-model.number="form.grace_period_off" type="number" min="0" class="input" />
              </label>
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button type="submit" :disabled="isSubmitting" class="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              {{ isSubmitting ? 'Création...' : 'Créer l\'Onduleur' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { upsApi } from '../api'
import type { UpsCreationDto } from '../types'
import { roomApi } from '@/features/rooms/api'
import type { RoomResponseDto } from '@/features/rooms/types'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'created'])

const form = ref<UpsCreationDto>({
  name: '',
  ip: '',
  login: '',
  password: '',
  grace_period_on: 0,
  grace_period_off: 0,
  roomId: ''
})

const rooms = ref<RoomResponseDto[]>([])
const selectedRoom = ref<RoomResponseDto | null>(null)

const modalRef = ref<HTMLElement | null>(null)
const isSubmitting = ref(false)

onClickOutside(modalRef, () => emit('close'))

const loadRooms = async () => {
  try {
    rooms.value = await roomApi.fetchRooms()
  } catch {
    rooms.value = []
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) loadRooms()
  }
)

watch(
  () => form.value.roomId,
  async (id) => {
    if (!id) {
      selectedRoom.value = null
      return
    }
    try {
      selectedRoom.value = await roomApi.fetchRoomById(id)
    } catch {
      selectedRoom.value = null
    }
  }
)

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await upsApi.create(form.value)
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
