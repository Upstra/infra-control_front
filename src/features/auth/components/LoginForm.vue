<!-- src/features/auth/components/LoginForm.vue -->
<template>
  <div class="space-y-6">
    <!-- OAuth Google si tu souhaites : stub pour l’exemple -->
    <button type="button"
      class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition"
      @click="handleOAuthGoogle">
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
        <label for="identifier" class="block text-sm text-neutral-dark mb-1">
          Nom d'utilisateur ou email
        </label>
        <input id="identifier" v-model="identifier" type="text" placeholder="john_doe ou john.doe@example.com" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div>
        <label for="password" class="block text-sm text-neutral-dark mb-1">
          Mot de passe
        </label>
        <input id="password" v-model="password" type="password" placeholder="********" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div v-if="error" class="text-danger text-sm text-center">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading"
        class="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-60">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref } from 'vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';

// Événements émis
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error', message: string): void;
}>();

const toast = useToast();
const store = useAuthStore();

const identifier = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

function handleOAuthGoogle() {
  toast.info('OAuth Google: fonctionnalité à implémenter selon ton backend');
}

async function handleLogin() {
  error.value = null;
  loading.value = true;
  try {
    await store.loginUser({ identifier: identifier.value, password: password.value });
    emit('success');
  } catch (err: any) {
    console.error('LoginForm error:', err);
    const message = err.message || 'Erreur inconnue';
    error.value = message;
    emit('error', message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.text-danger {
  color: #dc2626;
}

.bg-primary {
  background-color: #2563eb;
}

.hover\:bg-primary-dark:hover {
  background-color: #1e40af;
}

.focus\:ring-primary:focus {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
}
</style>
