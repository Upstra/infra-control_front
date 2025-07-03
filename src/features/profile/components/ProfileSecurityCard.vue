<script setup lang="ts">
import { ref } from 'vue';
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/vue/24/outline';
import ResetPasswordModal from './ResetPasswordModal.vue';
import type { User } from '@/features/users/types';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ user: User | null }>();
const emit = defineEmits(['toggle2fa', 'reset-success']);
const { t } = useI18n();

const showReset = ref(false);
</script>

<template>
  <section
    class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-5"
  >
    <h2
      class="text-lg font-semibold text-neutral-darker dark:text-white flex items-center gap-2"
    >
      <ShieldCheckIcon class="w-5 h-5" /> {{ t('profile.security_title') }}
    </h2>
    <div class="flex items-center justify-between">
      <p class="text-sm dark:text-neutral-300">
        {{ t('profile.two_factor_auth') }}
      </p>
      <button
        @click="emit('toggle2fa')"
        :class="[
          'px-3 py-1 text-xs rounded border transition flex items-center gap-1',
          props.user?.isTwoFactorEnabled
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/40'
            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        ]"
      >
        {{
          props.user?.isTwoFactorEnabled
            ? t('profile.disable')
            : t('profile.enable')
        }}
      </button>
    </div>
    <div class="flex items-center justify-between">
      <p class="text-sm dark:text-neutral-300">
        {{ t('profile.reset_password') }}
      </p>
      <button
        @click="showReset = true"
        class="flex items-center gap-1 px-3 py-1 text-xs rounded border bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 border-neutral-300 dark:border-neutral-600"
      >
        <LockClosedIcon class="w-4 h-4" /> {{ t('profile.reset_password') }}
      </button>
    </div>
  </section>
  <ResetPasswordModal
    :open="showReset"
    @close="showReset = false"
    @success="$emit('reset-success')"
  />
</template>
