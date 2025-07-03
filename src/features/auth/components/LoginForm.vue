<template>
  <div class="space-y-6">
    <Button 
      variant="outline" 
      class="w-full justify-start gap-3" 
      @click="handleOAuthGoogle"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {{ t('auth.form.google') }}
    </Button>

    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">
          {{ t('auth.form.or') }}
        </span>
      </div>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <div class="space-y-2">
        <Label for="identifier">{{ t('auth.form.identifier') }}</Label>
        <Input
          id="identifier"
          type="text"
          :placeholder="
            t('auth.form.identifier_placeholder', {
              email: 'john.doe@example.com',
            })
          "
          v-model="identifier"
          @keydown.enter="switchToPassword"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password">{{ t('auth.form.password') }}</Label>
        <div class="relative">
          <Input
            id="password"
            ref="passwordInput"
            :type="passwordFieldType"
            placeholder="••••••••"
            v-model="password"
            @keydown.enter="handleLogin"
            required
            class="pr-10"
          />
          <button
            type="button"
            tabindex="-1"
            class="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
            @click="togglePasswordFieldType"
            :aria-label="t('auth.form.password_toggle')"
          >
            <component
              :is="passwordFieldType === 'password' ? Eye : EyeClosed"
              class="h-4 w-4"
            />
          </button>
        </div>
        <div class="flex justify-end">
          <a
            href="#"
            class="text-sm text-primary hover:underline"
          >
            {{ t('auth.form.forgot_password') }}
          </a>
        </div>
      </div>

      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <Button
        type="submit"
        class="w-full"
        :disabled="loading"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {{ t('auth.form.submit_login_loading') }}
        </span>
        <span v-else>{{ t('auth.form.submit_login') }}</span>
      </Button>
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
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import { Alert, AlertDescription } from '@/components/ui/alert';

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