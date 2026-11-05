<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { latestDetails } from '../../domain/details';
import { fmt } from '@/shared/utils/fmt';
import type { Alert } from '../../types';

const props = defineProps<{ alert: Alert }>();

const { t } = useI18n();
const fields = computed(() => latestDetails(props.alert));
</script>

<template>
  <dl v-if="fields.length" class="m-0 flex flex-col gap-4 font-mono tnum">
    <div v-for="field in fields" :key="field.key">
      <dt class="text-overline text-text-muted">
        {{ t(`alerts.details.${field.key}`) }}
      </dt>
      <dd
        class="m-0 whitespace-nowrap text-[20px] leading-[26px] text-text-strong"
      >
        {{ fmt.value(field.value, field.unit) }}
      </dd>
    </div>
  </dl>
</template>
