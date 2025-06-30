<template>
  <div class="space-y-6">
    <button
      type="button"
      class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition"
      @click="handleOAuthGoogle"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        class="w-5 h-5"
      />
      <span class="text-sm font-medium text-neutral-darker">{{
        t('auth.form.google')
      }}</span>
    </button>

    <div class="flex items-center gap-2 text-xs text-neutral-400">
      <div class="flex-grow h-px bg-neutral-200"></div>
      {{ t('auth.form.or') }}
      <div class="flex-grow h-px bg-neutral-200"></div>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="identifier" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.identifier') }}
        </label>
        <input
          id="identifier"
          v-model="identifier"
          type="text"
          @keyup.enter="switchToPassword"
          :placeholder="
            t('auth.form.identifier_placeholder', {
              email: 'john.doe@example.com',
            })
          "
          required
          class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label for="password" class="block text-sm text-neutral-dark mb-1">
          {{ t('auth.form.password') }}
        </label>
        <div class="relative">
          <input
            id="password"
            ref="passwordInput"
            v-model="password"
            :type="passwordFieldType"
            @keyup.enter="handleLogin"
            placeholder="********"
            required
            autocomplete="current-password"
            class="w-full pr-12 pl-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          <button
            type="button"
            tabindex="-1"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-primary-dark transition"
            @click="togglePasswordFieldType"
            :aria-label="t('auth.form.password_toggle')"
          >
            <component
              :is="passwordFieldType === 'password' ? Eye : EyeClosed"
              class="w-5 h-5"
            />
          </button>
        </div>
        <div class="flex justify-end">
          <a href="#" class="text-xs text-primary hover:underline mt-2">{{
            t('auth.form.forgot_password')
          }}</a>
        </div>
      </div>

      <div v-if="error" class="text-danger text-sm text-center">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-60"
      >
        {{
          loading
            ? t('auth.form.submit_login_loading')
            : t('auth.form.submit_login')
        }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';
import { Eye, EyeClosed } from 'lucide-vue-next';
import { usePasswordToggle } from '../composables/usePasswordToggle';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error', message: string): void;
}>();

const toast = useToast();
const store = useAuthStore();
const { t } = useI18n();

const identifier = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const { fieldType: passwordFieldType, toggle: togglePasswordFieldType } =
  usePasswordToggle();
usePasswordToggle();

const passwordInput = ref<HTMLInputElement | null>(null);

function handleOAuthGoogle() {
  toast.info(t('auth.form.oauth_unavailable'));
}

async function handleLogin() {
  error.value = null;
  loading.value = true;
  try {
    await store.loginUser({
      identifier: identifier.value,
      password: password.value,
    });
    emit('success');
  } catch (err: any) {
    const message = err.message || t('errors.unknown');
    error.value = message;
    emit('error', message);
  } finally {
    loading.value = false;
  }
}

const switchToPassword = () => {
  passwordInput.value?.focus();
};
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
