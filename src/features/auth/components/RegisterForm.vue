<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import type { RegisterDto } from '../types'

const router = useRouter()
const store = useAuthStore()

const form = ref<RegisterDto>({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: ''
})

const confirmEmail = ref('')
const confirmPassword = ref('')
const showConfirmEmail = ref(false)
const showConfirmPassword = ref(false)
const emailMismatch = ref(false)
const passwordMismatch = ref(false)

watch(() => form.value.email, (val) => {
  if (val.length > 0) showConfirmEmail.value = true
})
watch(() => form.value.password, (val) => {
  if (val.length > 0) showConfirmPassword.value = true
})

watch([() => form.value.email, confirmEmail], ([email, confirm]) => {
  emailMismatch.value = email !== confirm
})

watch([() => form.value.password, confirmPassword], ([pwd, confirm]) => {
  passwordMismatch.value = pwd !== confirm
})

const error = ref<string | null>(null)
const loading = ref(false)

const handleRegister = async () => {
  error.value = null

  if (emailMismatch.value || passwordMismatch.value) return

  loading.value = true
  try {
    await store.registerUser(form.value)
    router.push('/dashboard')
  } catch (err: any) {
    console.error(err)
    const msg = err.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : msg || err.message || 'Une erreur est survenue.'
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
      <span class="text-sm font-medium text-neutral-darker">Créer un compte avec Google</span>
    </button>
    <div class="flex items-center gap-2 text-xs text-neutral-400">
      <div class="flex-grow h-px bg-neutral-200"></div>
      ou
      <div class="flex-grow h-px bg-neutral-200"></div>
    </div>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm text-neutral-dark mb-1">Prénom</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            placeholder="Jean"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label for="lastName" class="block text-sm text-neutral-dark mb-1">Nom</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            placeholder="Dupont"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm text-neutral-dark mb-1">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="jean.dupont@email.com"
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div v-if="showConfirmEmail">
        <label for="confirmEmail" class="block text-sm text-neutral-dark mb-1">Confirmer l’email</label>
        <input
          id="confirmEmail"
          v-model="confirmEmail"
          type="email"
          placeholder="Retape ton email"
          @paste.prevent
          @copy.prevent
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          :class="{
            'border-danger focus:ring-danger': emailMismatch,
            'border-neutral-300 focus:ring-primary': !emailMismatch
          }"
        />
        <p v-if="emailMismatch" class="text-xs text-danger mt-1">Les emails ne correspondent pas</p>
      </div>

      <div>
        <label for="username" class="block text-sm text-neutral-dark mb-1">Nom d'utilisateur</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          placeholder="jdupont"
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label for="password" class="block text-sm text-neutral-dark mb-1">Mot de passe</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="********"
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div v-if="showConfirmPassword">
        <label for="confirmPassword" class="block text-sm text-neutral-dark mb-1">Confirmer le mot de passe</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="********"
          @paste.prevent
          @copy.prevent
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          :class="{
            'border-danger focus:ring-danger': passwordMismatch,
            'border-neutral-300 focus:ring-primary': !passwordMismatch
          }"
        />
        <p v-if="passwordMismatch" class="text-xs text-danger mt-1">Les mots de passe ne correspondent pas</p>
      </div>

      <div v-if="error" class="text-danger text-sm text-center">{{ error }}</div>

      <button
        type="submit"
        :disabled="loading || emailMismatch || passwordMismatch"
        class="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-60"
      >
        {{ loading ? 'Création...' : 'Créer un compte' }}
      </button>
    </form>
  </div>
</template>
