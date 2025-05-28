<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import ResetPasswordModal from './ResetPasswordModal.vue'
import type { User } from '@/features/users/types'

const props = defineProps<{ user: User | null }>()
const emit = defineEmits(['toggle2fa', 'reset-success'])

const showReset = ref(false)
</script>

<template>
  <section class="bg-white rounded-xl shadow p-6 border border-neutral-200 space-y-5">
    <h2 class="text-lg font-semibold text-neutral-darker flex items-center gap-2">
      <ShieldCheckIcon class="w-5 h-5" /> Sécurité du compte
    </h2>
    <div class="flex items-center justify-between">
      <p class="text-sm">Authentification à deux facteurs</p>
      <button @click="emit('toggle2fa')" :class="[
        'px-3 py-1 text-xs rounded border transition flex items-center gap-1',
        props.user?.isTwoFactorEnabled
          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
          : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
      ]">
        {{ props.user?.isTwoFactorEnabled ? 'Désactiver' : 'Activer' }}
      </button>
    </div>
    <div class="flex items-center justify-between">
      <p class="text-sm">Réinitialiser le mot de passe</p>
      <button @click="showReset = true"
        class="flex items-center gap-1 px-3 py-1 text-xs rounded border bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-neutral-300">
        <LockClosedIcon class="w-4 h-4" /> Changer
      </button>
    </div>
  </section>
  <ResetPasswordModal :open="showReset" @close="showReset = false" @success="$emit('reset-success')" />
</template>