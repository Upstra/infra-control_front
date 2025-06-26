<template>
  <div class="space-y-6">
    <button type="button"
      class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition"
      @click="handleOAuthGoogle">
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5" />
      <span class="text-sm font-medium text-neutral-darker">{{ t('auth.form.google') }}</span>
    </button>

    <div class="flex items-center gap-2 text-xs text-neutral-400">
      <div class="flex-grow h-px bg-neutral-200"></div>
      {{ t('auth.form.or') }}
      <div class="flex-grow h-px bg-neutral-200"></div>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm text-neutral-dark mb-1">{{ t('auth.form.firstname') }}</label>
          <input id="firstName" v-model="form.firstName" type="text" :placeholder="t('auth.form.firstname_placeholder')" required
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
        <div>
          <label for="lastName" class="block text-sm text-neutral-dark mb-1">{{ t('auth.form.lastname') }}</label>
          <input id="lastName" v-model="form.lastName" type="text" :placeholder="t('auth.form.lastname_placeholder')" required
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.email') }} <span class="text-danger">*</span>
        </label>
        <input id="email" v-model="form.email" type="email" :placeholder="t('auth.form.email_placeholder')" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div v-if="showConfirmEmail">
        <label for="confirmEmail" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.confirm_email') }} <span class="text-danger">*</span>
        </label>
        <input id="confirmEmail" v-model="confirmEmail" type="email" :placeholder="t('auth.form.confirm_email_placeholder')" @paste.prevent
          @copy.prevent required class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          :class="{
            'border-danger focus:ring-danger': emailMismatch,
            'border-neutral-300 focus:ring-primary': !emailMismatch
          }" />
        <p v-if="emailMismatch" class="text-xs text-danger mt-1">{{ t('profile.password_mismatch') }}</p>
      </div>

      <div>
        <label for="username" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.username') }} <span class="text-danger">*</span>
        </label>
        <input id="username" v-model="form.username" type="text" :placeholder="t('auth.form.username_placeholder')" required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <div>
        <label for="password" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.password') }} <span class="text-danger">*</span>
        </label>
        <div class="relative">
          <input id="password" v-model="form.password" :type="passwordFieldType" :placeholder="t('auth.form.password_placeholder')" required
            class="w-full pr-12 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          <button type="button" tabindex="-1"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-primary-dark transition"
            @click="togglePasswordFieldType"
            :aria-label="t('auth.form.password_toggle')">
            <component :is="passwordFieldType === 'password' ? Eye : EyeClosed" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="showConfirmPassword">
        <label for="confirmPassword" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.confirm_password') }} <span class="text-danger">*</span>
        </label>
        <div class="relative">
          <input id="confirmPassword" v-model="confirmPassword" :type="confirmPasswordFieldType" :placeholder="t('auth.form.confirm_password_placeholder')" @paste.prevent
            @copy.prevent required class="w-full pr-12 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            :class="{
              'border-danger focus:ring-danger': passwordMismatch,
              'border-neutral-300 focus:ring-primary': !passwordMismatch
            }" />
          <button type="button" tabindex="-1"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-primary-dark transition"
            @click="toggleConfirmPasswordFieldType"
            :aria-label="t('auth.form.password_toggle')">
            <component :is="confirmPasswordFieldType === 'password' ? Eye : EyeClosed" class="w-5 h-5" />
          </button>
        </div>
        <p v-if="passwordMismatch" class="text-xs text-danger mt-1">{{ t('profile.password_mismatch') }}</p>
      </div>

      <div v-if="error" class="text-danger text-sm text-center">{{ error }}</div>

      <button type="submit" :disabled="loading || emailMismatch || passwordMismatch"
        class="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-60">
        {{ loading ? t('auth.form.submit_register_loading') : t('auth.form.submit_register') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../store';
import type { RegisterDto } from '../types';
import { useToast } from 'vue-toast-notification';
import { Eye, EyeClosed } from 'lucide-vue-next';
import { usePasswordToggle } from '../composables/usePasswordToggle';
import { useI18n } from 'vue-i18n';


const emit = defineEmits<{
  (e: 'success', payload: { token: string }): void;
  (e: 'error', message: string): void;
}>();

const toast = useToast();
const store = useAuthStore();
const { t } = useI18n();

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

const { fieldType: passwordFieldType, toggle: togglePasswordFieldType } = usePasswordToggle();
const { fieldType: confirmPasswordFieldType, toggle: toggleConfirmPasswordFieldType } = usePasswordToggle();

function handleOAuthGoogle() {
  toast.info(t('auth.form.oauth_unavailable'));
}

async function handleRegister() {
  error.value = null;
  if (emailMismatch.value || passwordMismatch.value) return;
  loading.value = true;
  try {
    await store.registerUser(form.value);
    let token = store.token;
    if (!token) throw new Error(t('errors.no_registration_token'));
    emit('success', { token });
  } catch (err: any) {
    console.error('RegisterForm error:', err);
    const msg = err.response?.data?.message;
    const message = Array.isArray(msg) ? msg.join('\n') : msg || err.message || t('errors.unknown');
    error.value = message;
    emit('error', message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.text-danger { color: #dc2626; }
.bg-primary { background-color: #2563eb; }
.hover\:bg-primary-dark:hover { background-color: #1e40af; }
.focus\:ring-primary:focus { box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5); }
</style>
