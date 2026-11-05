<script setup lang="ts">
import { toRef } from 'vue';
import UpsCallout from './UpsCallout.vue';
import UpsReadings from './UpsReadings.vue';
import UpsHistory from './UpsHistory.vue';
import { useUpsCountdown } from '../../../composables/useUpsCountdown';
import type { UpsCondition } from '../../../domain/condition';
import type { BatteryStatus, UpsResponseDto } from '../../../types';

const props = defineProps<{
  ups: UpsResponseDto;
  status: BatteryStatus | null;
  condition: UpsCondition;
}>();

const { start, countdown } = useUpsCountdown(toRef(props, 'ups'));
</script>

<template>
  <div class="flex flex-col gap-6">
    <UpsCallout
      :condition="condition"
      :status="status"
      :countdown="countdown"
      :outage-start="start"
    />
    <UpsReadings :ups="ups" :status="status" :condition="condition" />
    <UpsHistory :ups-id="ups.id" :ups-name="ups.name" />
  </div>
</template>
