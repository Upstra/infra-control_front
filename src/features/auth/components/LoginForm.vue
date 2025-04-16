<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
//const { showToast } = useToaster()

import {useToast} from 'vue-toast-notification';
const $toast = useToast();

import 'vue-toast-notification/dist/theme-sugar.css';

const router = useRouter()
const store = useAuthStore()

const identifier = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const handleLogin = async () => {
  error.value = null
  loading.value = true
  try {
    await store.loginUser({ identifier: identifier.value, password: password.value })
   // showToast('Connexion réussie', 'success')
   $toast.success('Connexion réussie', {
    position: 'top-right',
    duration: 5000,
    dismissible: true,
    type: 'success',

   });

    router.push(store.requiresTwoFactor ? '/mfa-challenge' : '/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Erreur inconnue'
   // showToast(error.value || '', 'error')
    $toast.error(error.value || '', {
      position: 'top-right',
      duration: 5000,
      dismissible: true,
      type: 'error',
  
    });
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <button
      class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition"
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5" />
      <span class="text-sm font-medium text-neutral-darker">Se connecter avec Google</span>
    </button>

    <div class="flex items-center gap-2 text-xs text-neutral-400">
      <div class="flex-grow h-px bg-neutral-200"></div>
      ou
      <div class="flex-grow h-px bg-neutral-200"></div>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="identifier" class="block text-sm text-neutral-dark mb-1">Nom d'utilisateur ou email</label>
        <input
          id="identifier"
          v-model="identifier"
          type="text"
          placeholder="john_doe or john.doe@example.com"
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label for="password" class="block text-sm text-neutral-dark mb-1">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="********"
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div v-if="error" class="text-danger text-sm text-center">{{ error }}</div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-60"
      >
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>
