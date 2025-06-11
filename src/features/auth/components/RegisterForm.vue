<template>
  <div class="space-y-6">
    <button type="button"
      class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition"
      @click="handleOAuthGoogle">
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
          <input id="firstName" v-model="form.firstName" type="text" placeholder="Jean" required
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
        <div>
          <label for="lastName" class="block text-sm text-neutral-dark mb-1">Nom</label>
          <input id="lastName" v-model="form.lastName" type="text" placeholder="Dupont" required
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm text-neutral-dark mb-1">
          Email <span class="text-danger">*</span>
        </label>
        <input id="email" v-model="form.email" type="email" placeholder="jean.dupont@email.com" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div v-if="showConfirmEmail">
        <label for="confirmEmail" class="block text-sm text-neutral-dark mb-1">
          Confirmer l’email <span class="text-danger">*</span>
        </label>
        <input id="confirmEmail" v-model="confirmEmail" type="email" placeholder="Retape ton email" @paste.prevent
          @copy.prevent required class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          :class="{
            'border-danger focus:ring-danger': emailMismatch,
            'border-neutral-300 focus:ring-primary': !emailMismatch
          }" />
        <p v-if="emailMismatch" class="text-xs text-danger mt-1">Les emails ne correspondent pas</p>
      </div>

      <div>
        <label for="username" class="block text-sm text-neutral-dark mb-1">
          Nom d'utilisateur <span class="text-danger">*</span>
        </label>
        <input id="username" v-model="form.username" type="text" placeholder="jdupont" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div>
        <label for="password" class="block text-sm text-neutral-dark mb-1">
          Mot de passe <span class="text-danger">*</span>
        </label>
        <input id="password" v-model="form.password" type="password" placeholder="********" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div v-if="showConfirmPassword">
        <label for="confirmPassword" class="block text-sm text-neutral-dark mb-1">
          Confirmer le mot de passe <span class="text-danger">*</span>
        </label>
        <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="********" @paste.prevent
          @copy.prevent required class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          :class="{
            'border-danger focus:ring-danger': passwordMismatch,
            'border-neutral-300 focus:ring-primary': !passwordMismatch
          }" />
        <p v-if="passwordMismatch" class="text-xs text-danger mt-1">Les mots de passe ne correspondent pas</p>
      </div>

      <div v-if="error" class="text-danger text-sm text-center">{{ error }}</div>

      <button type="submit" :disabled="loading || emailMismatch || passwordMismatch"
        class="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-60">
        {{ loading ? 'Création...' : 'Créer un compte' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
// Import nécessaires
import { ref, watch } from 'vue';
import { useAuthStore } from '../store';
import type { RegisterDto } from '../types';
import { useToast } from 'vue-toast-notification';

// Déclaration des événements émis
const emit = defineEmits<{
  (e: 'success', payload: { token: string }): void;
  (e: 'error', message: string): void;
}>();

const toast = useToast();
const store = useAuthStore();

// Formulaire et validations locales
const form = ref<RegisterDto>({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: ''
});

const confirmEmail = ref('');
const confirmPassword = ref('');
const showConfirmEmail = ref(false);
const showConfirmPassword = ref(false);
const emailMismatch = ref(false);
const passwordMismatch = ref(false);

watch(() => form.value.email, (val) => {
  showConfirmEmail.value = val.length > 0;
});
watch(() => form.value.password, (val) => {
  showConfirmPassword.value = val.length > 0;
});

watch([() => form.value.email, confirmEmail], ([email, confirm]) => {
  emailMismatch.value = email !== confirm;
});
watch([() => form.value.password, confirmPassword], ([pwd, confirm]) => {
  passwordMismatch.value = pwd !== confirm;
});

const error = ref<string | null>(null);
const loading = ref(false);

function handleOAuthGoogle() {
  toast.info('OAuth Google indisponible pour l’instant');
}

// Lors de la soumission
async function handleRegister() {
  error.value = null;
  // Ne soumet pas si mismatch
  if (emailMismatch.value || passwordMismatch.value) {
    return;
  }
  loading.value = true;
  try {
    await store.registerUser(form.value);
    let token = store.token;
    if (!token) {
      throw new Error('Token non récupéré après l’inscription');
    }
    emit('success', {
      token: token
    });
  } catch (err: any) {
    console.error('RegisterForm error:', err);
    const msg = err.response?.data?.message;
    const message = Array.isArray(msg) ? msg.join('\n') : msg || err.message || 'Une erreur est survenue.';
    error.value = message;
    emit('error', message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Ajuste selon ton design/global CSS */
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
