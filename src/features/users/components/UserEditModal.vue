<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { User } from '../types'
import type { Role } from '@/features/roles/types'
import { onClickOutside } from '@vueuse/core'
import { XMarkIcon, UserIcon, EnvelopeIcon, IdentificationIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

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

const modalRef = ref<HTMLElement | null>(null)
onClickOutside(modalRef, () => emit('close'))
</script>

<template>
  <transition name="slide">
    <div
      v-if="isOpen && user"
      class="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50"
    >
      <div
        ref="modalRef"
        class="w-full max-w-md h-full bg-white p-6 overflow-y-auto shadow-2xl relative border-l border-neutral-200"
      >
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-darker"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-4 mb-6">
          <img
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=0D8ABC&color=fff`"
            alt="avatar"
            class="w-12 h-12 rounded-full"
          />
          <div>
            <h2 class="text-lg font-semibold text-neutral-darker leading-tight">
              {{ user?.username }}
            </h2>
            <p class="text-sm text-neutral-500">{{ user?.email }}</p>
            <p class="text-xs text-neutral-400">{{ user?.firstName }} {{ user?.lastName }}</p>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-darker mb-1 flex items-center gap-1">
              <UserIcon class="w-4 h-4" /> Nom d'utilisateur
            </label>
            <input
              v-model="localUser.username"
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-darker mb-1 flex items-center gap-1">
                <IdentificationIcon class="w-4 h-4" /> Prénom
              </label>
              <input
                v-model="localUser.firstName"
                type="text"
                required
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-darker mb-1 flex items-center gap-1">
                <IdentificationIcon class="w-4 h-4" /> Nom
              </label>
              <input
                v-model="localUser.lastName"
                type="text"
                required
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-darker mb-1 flex items-center gap-1">
              <EnvelopeIcon class="w-4 h-4" /> Email
            </label>
            <input
              v-model="localUser.email"
              type="email"
              required
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-darker mb-1 flex items-center gap-1">
              <ShieldCheckIcon class="w-4 h-4" /> Rôle
            </label>
            <select
              v-model="localUser.roleId"
              required
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg border text-neutral-dark hover:bg-neutral-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
