<script setup lang="ts">
import { PowerIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';

interface Props {
  upsMetrics: {
    inputVoltage: number;
    outputVoltage: number;
    frequency: number;
  };
  ups: {
    grace_period_on?: number;
    grace_period_off?: number;
  };
  totalPower: number;
}

defineProps<Props>();
const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <h3
      class="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
    >
      <PowerIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <span>{{ t('ups.power_specifications') }}</span>
    </h3>

    <div
      class="bg-slate-50 dark:bg-neutral-900 rounded-xl p-5 space-y-4 border border-slate-200 dark:border-neutral-700"
    >
      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span
              class="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {{ t('ups.input_voltage') }}
            </span>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ upsMetrics.inputVoltage.toFixed(1) }}V
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span
              class="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {{ t('ups.output_voltage') }}
            </span>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ upsMetrics.outputVoltage.toFixed(1) }}V
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span
              class="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {{ t('ups.frequency') }}
            </span>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ upsMetrics.frequency.toFixed(1) }}Hz
            </span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span
              class="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {{ t('ups.total_load') }}
            </span>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ totalPower }}W
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span
              class="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {{ t('ups.grace_period_on') }}
            </span>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ ups.grace_period_on || 30 }}s
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span
              class="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {{ t('ups.grace_period_off') }}
            </span>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ ups.grace_period_off || 60 }}s
            </span>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-200 dark:border-neutral-700">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-500">
            {{ t('ups.efficiency_rating') }}
          </span>
          <span
            class="text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            95.8%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
