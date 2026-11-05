<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormField } from '@/shared/components/pulse';
import {
  THRESHOLD_MAX,
  THRESHOLD_MIN,
  validateThresholds,
  type ThresholdInputs,
} from '../domain/thresholds';

const model = defineModel<ThresholdInputs>({ required: true });
const { t } = useI18n();

const error = computed(() => validateThresholds(model.value));
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-2 gap-3">
      <FormField :label="t('roomsPage.thresholds.warn')">
        <input
          v-model="model.warn"
          type="number"
          :min="THRESHOLD_MIN"
          :max="THRESHOLD_MAX"
          step="0.5"
          class="pulse-input font-mono"
          data-field="warn"
        />
      </FormField>
      <FormField :label="t('roomsPage.thresholds.crit')">
        <input
          v-model="model.crit"
          type="number"
          :min="THRESHOLD_MIN"
          :max="THRESHOLD_MAX"
          step="0.5"
          class="pulse-input font-mono"
          data-field="crit"
        />
      </FormField>
    </div>
    <span v-if="error" class="text-caption text-danger-text" role="alert">{{
      t(`roomsPage.thresholds.errors.${error}`)
    }}</span>
    <span v-else class="text-caption text-text-muted">{{
      t('roomsPage.thresholds.help')
    }}</span>
  </div>
</template>
