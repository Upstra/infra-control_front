<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';
import TwoFACodeInput from './TwoFACodeInput.vue';
import { handle2FASuccess } from '@/router';

import RecoveryCodesCard from './RecoveryCodesCard.vue';
import { useI18n } from 'vue-i18n';

const store = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const error = ref<string | null>(null);
const loading = ref(false);
const codeInputRef = ref<any>(null);
const recoveryCode = ref('');
const recoveryMode = ref(false);
const showRecovery = ref(false);

const toggleMode = () => {
  error.value = null;
  recoveryCode.value = '';
  recoveryMode.value = !recoveryMode.value;
};

const handleCode = async (code: string) => {
  error.value = null;
  loading.value = true;
  try {
    await store.verifyTwoFA({ code });

    if (store.recoveryCodes.length > 0) {
      showRecovery.value = true;
    } else {
      handle2FASuccess();
    }
  } catch (err: any) {
    error.value = err.message;
    codeInputRef.value?.triggerShake();
    toast.error(t('auth.messages.invalid_2fa_code'));
    codeInputRef.value?.triggerShake();
    codeInputRef.value?.reset();
  } finally {
    loading.value = false;
  }
};
const handleRecovery = async (code: string) => {
  error.value = null;
  loading.value = true;
  try {
    const recoveryCode = code.toUpperCase();
    await store.verifyTwoFARecovery({ recoveryCode });
    handle2FASuccess();
  } catch (err: any) {
    error.value = err.message;
    codeInputRef.value?.triggerShake();
    toast.error(t('auth.messages.invalid_recovery_code'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex justify-center px-4 py-20 bg-neutral-light">
    <div
      class="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-neutral-200"
    >
      <template v-if="showRecovery">
        <RecoveryCodesCard
          :codes="store.recoveryCodes"
          :on-validate="handle2FASuccess"
        />
      </template>

      <template v-else>
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-neutral-darker">
            {{ t('auth.twofa.title') }}
          </h1>
          <p class="text-sm text-neutral-dark mt-1">
            {{
              recoveryMode
                ? t('auth.twofa.enter_recovery')
                : t('auth.twofa.enter_app_code')
            }}
          </p>
        </div>

        <form @submit.prevent class="space-y-6">
          <div v-if="!recoveryMode">
            <label class="block text-sm text-neutral-dark mb-2"
              >{{ t('auth.twofa.code_label') }}
              <TwoFACodeInput
                ref="codeInputRef"
                inputMode="numeric"
                :length="6"
                @complete="handleCode"
              />
            </label>
          </div>

          <div v-else>
            <label class="block text-sm text-neutral-dark mb-2"
              >{{ t('auth.twofa.recovery_label') }}
              <TwoFACodeInput
                inputMode="text"
                :length="8"
                :placeholder="'VJC7SKSP'"
                :separator="[4]"
                @complete="handleRecovery"
              />
            </label>
          </div>

          <div v-if="error" class="text-danger text-sm text-center">
            {{ error }}
          </div>
        </form>

        <div class="text-center mt-6">
          <button
            type="button"
            class="text-sm text-primary hover:underline"
            @click="toggleMode"
          >
            {{
              recoveryMode
                ? t('auth.twofa.switch_to_app')
                : t('auth.twofa.switch_to_recovery')
            }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
