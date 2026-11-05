<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Power, Check, ArrowUpRight, RotateCcw } from 'lucide-vue-next';
import { resourceLink } from '../../domain/resource';
import type { Alert } from '../../types';

const props = defineProps<{
  alert: Alert;
  canAcknowledge: boolean;
  pending: boolean;
}>();

const emit = defineEmits<{ acknowledge: []; remediate: [] }>();

const { t } = useI18n();
const link = computed(() => resourceLink(props.alert));
const isUps = computed(() => props.alert.resourceType === 'ups');
</script>

<template>
  <div class="flex flex-wrap items-center gap-2.5">
    <button
      v-if="isUps"
      type="button"
      class="pulse-press inline-flex h-10 items-center gap-2 rounded-md bg-danger-solid px-4 font-medium text-on-primary hover:bg-danger"
      @click="emit('remediate')"
    >
      <Power class="h-4 w-4" aria-hidden="true" />{{
        t('alerts.banner.shutdown')
      }}
    </button>
    <button
      v-if="canAcknowledge"
      type="button"
      :disabled="pending"
      class="pulse-press inline-flex h-10 items-center gap-2 rounded-md border border-border-strong px-4 font-medium text-text-strong hover:bg-surface-raised disabled:opacity-60"
      data-part="acknowledge"
      @click="emit('acknowledge')"
    >
      <RotateCcw v-if="alert.acknowledged" class="h-4 w-4" aria-hidden="true" />
      <Check v-else class="h-4 w-4" aria-hidden="true" />
      {{
        alert.acknowledged
          ? t('alerts.banner.reopen')
          : t('alerts.banner.acknowledge')
      }}
    </button>
    <router-link
      :to="link"
      class="pulse-press inline-flex h-10 items-center gap-2 rounded-md px-3.5 font-medium text-text hover:bg-surface-raised"
    >
      {{ t('alerts.banner.open', { name: alert.resourceName }) }}
      <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
    </router-link>
  </div>
</template>
