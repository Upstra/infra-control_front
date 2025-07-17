<script setup lang="ts">
import { ref } from 'vue';
import { Copy, Check } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { codes, onValidate } = defineProps<{
  codes: string[];
  onValidate: () => void;
}>();

const copied = ref(false);
const { t } = useI18n();

const copyAll = async () => {
  await navigator.clipboard.writeText(codes.join('\n'));
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>

<template>
  <div class="space-y-4 border-t pt-6">
    <h3 class="text-lg font-semibold text-center text-neutral-darker">
      {{ t('auth.messages.recovery_codes_title') }}
    </h3>
    <p class="text-sm text-neutral-dark text-center">
      {{ t('auth.messages.recovery_codes_desc') }}
    </p>

    <ul class="grid grid-cols-2 gap-2 text-sm font-mono text-center">
      <li
        v-for="code in codes"
        :key="code"
        class="py-2 px-3 border rounded-lg bg-neutral-100 text-neutral-darker"
      >
        {{ code }}
      </li>
    </ul>

    <div class="flex justify-between items-center mt-4">
      <button
        @click="copyAll"
        class="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <component :is="copied ? Check : Copy" class="w-4 h-4" />
        {{
          copied
            ? t('auth.messages.recovery_copy_success')
            : t('auth.messages.recovery_copy')
        }}
      </button>

      <button
        @click="onValidate"
        class="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition"
      >
        {{ t('auth.messages.recovery_noted') }}
      </button>
    </div>
  </div>
</template>
