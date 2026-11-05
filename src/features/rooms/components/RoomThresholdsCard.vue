<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from '@/shared/components/Card.vue';
import CardContent from '@/shared/components/CardContent.vue';
import CardHeader from '@/shared/components/CardHeader.vue';
import CardTitle from '@/shared/components/CardTitle.vue';
import RoomThresholdFields from './RoomThresholdFields.vue';
import { roomApi } from '../api';
import {
  thresholdInputs,
  toThresholds,
  validateThresholds,
} from '../domain/thresholds';
import { useToast } from '@/shared/composables/useToast';
import type { RoomResponseDto } from '../types';

const props = defineProps<{ room: RoomResponseDto }>();
const emit = defineEmits<{ saved: [room: RoomResponseDto] }>();

const { t } = useI18n();
const toast = useToast();
const inputs = ref(thresholdInputs(props.room));
const saving = ref(false);

watch(
  () => props.room.id,
  () => (inputs.value = thresholdInputs(props.room)),
);

const save = async () => {
  if (validateThresholds(inputs.value)) return;
  saving.value = true;
  try {
    const saved = await roomApi.updateRoom(props.room.id, {
      name: props.room.name,
      ...toThresholds(inputs.value),
    });
    toast.showSuccess(
      t('roomsPage.thresholds.saved', { name: props.room.name }),
    );
    emit('saved', saved);
  } catch {
    toast.showError(t('roomsPage.thresholds.failed'));
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader
      ><CardTitle>{{ t('roomsPage.thresholds.title') }}</CardTitle></CardHeader
    >
    <CardContent>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="save">
        <RoomThresholdFields v-model="inputs" />
        <button
          type="submit"
          class="pulse-btn-primary self-end"
          :disabled="saving || !!validateThresholds(inputs)"
        >
          {{ t('roomsPage.thresholds.save') }}
        </button>
      </form>
    </CardContent>
  </Card>
</template>
