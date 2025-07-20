<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      @click="testConnection"
      :disabled="!ip || isPinging || disabled"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
      :class="buttonClasses"
    >
      <Wifi v-if="!isPinging && !lastResult" :size="16" />
      <Loader2 v-if="isPinging" :size="16" class="animate-spin" />
      <CheckCircle v-if="lastResult?.accessible" :size="16" />
      <XCircle v-if="lastResult && !lastResult.accessible" :size="16" />

      {{ buttonText }}
    </button>

    <span v-if="lastResult" class="text-xs" :class="resultTextClass">
      {{ resultText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, readonly } from 'vue';
import { Wifi, Loader2, CheckCircle, XCircle } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';

interface PingResult {
  accessible: boolean;
  responseTime?: number;
  error?: string;
}

interface Props {
  ip: string;
  pingFunction: (ip: string) => Promise<PingResult>;
  disabled?: boolean;
}

const props = defineProps<Props>();
const { t } = useI18n();
const toast = useToast();

const isPinging = ref(false);
const lastResult = ref<PingResult | null>(null);

const testConnection = async () => {
  if (!props.ip || isPinging.value) return;

  isPinging.value = true;
  lastResult.value = null;

  try {
    const result = await props.pingFunction(props.ip);
    lastResult.value = result;

    if (result.accessible) {
      toast.success(t('connectivity.ping_success'));
    } else {
      toast.error(t('connectivity.ping_failed'));
    }
  } catch (error: any) {
    lastResult.value = {
      accessible: false,
      error: error.message || t('connectivity.ping_error'),
    };
    toast.error(t('connectivity.ping_error'));
  } finally {
    isPinging.value = false;
  }
};

const buttonClasses = computed(() => {
  if (props.disabled || !props.ip) {
    return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed';
  }

  if (isPinging.value) {
    return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  }

  if (lastResult.value?.accessible) {
    return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
  }

  if (lastResult.value && !lastResult.value.accessible) {
    return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
  }

  return 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600';
});

const buttonText = computed(() => {
  if (isPinging.value) return t('connectivity.testing');
  if (lastResult.value?.accessible) return t('connectivity.connected');
  if (lastResult.value && !lastResult.value.accessible)
    return t('connectivity.retry_connection');
  return t('connectivity.test_connection');
});

const resultTextClass = computed(() => {
  if (lastResult.value?.accessible) {
    return 'text-green-600 dark:text-green-400';
  }
  return 'text-red-600 dark:text-red-400';
});

const resultText = computed(() => {
  if (!lastResult.value) return '';

  if (lastResult.value.accessible && lastResult.value.responseTime) {
    return t('connectivity.response_time', {
      time: lastResult.value.responseTime,
    });
  }

  if (lastResult.value.error) {
    return lastResult.value.error;
  }

  return lastResult.value.accessible
    ? t('connectivity.reachable')
    : t('connectivity.unreachable');
});

defineExpose({
  testConnection,
  isPinging: readonly(isPinging),
  lastResult: readonly(lastResult),
});
</script>
