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
    return 'bg-surface-raised text-text-muted border-border cursor-not-allowed';
  }

  if (isPinging.value) {
    return 'bg-warning-surface text-warning-text border-warning/40';
  }

  if (lastResult.value?.accessible) {
    return 'bg-success-surface text-success-text border-success-border';
  }

  if (lastResult.value && !lastResult.value.accessible) {
    return 'bg-danger-surface text-danger-text border-danger-border';
  }

  return 'bg-surface text-text border-border-control hover:bg-surface-sunken';
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
    return 'text-success-text';
  }
  return 'text-danger-text';
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
