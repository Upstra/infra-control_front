<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/shared/components/Modal.vue';
import { FormField } from '@/shared/components/pulse';
import RoomThresholdFields from './RoomThresholdFields.vue';
import { roomApi } from '../api';
import { toThresholds, validateThresholds } from '../domain/thresholds';
import { useToast } from '@/shared/composables/useToast';
import type { RoomResponseDto } from '../types';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: []; created: [room: RoomResponseDto] }>();

const { t } = useI18n();
const toast = useToast();
const name = ref('');
const thresholds = ref({ warn: '', crit: '' });
const submitting = ref(false);
const touched = ref(false);

watch(
  () => props.isOpen,
  (open) => {
    if (open) return;
    name.value = '';
    thresholds.value = { warn: '', crit: '' };
    touched.value = false;
  },
);

const nameError = computed(() =>
  touched.value && !name.value.trim()
    ? t('roomsPage.create.name_required')
    : null,
);

const submit = async () => {
  touched.value = true;
  if (!name.value.trim() || validateThresholds(thresholds.value)) return;
  submitting.value = true;
  try {
    const created = await roomApi.createRoom({
      name: name.value.trim(),
      ...toThresholds(thresholds.value),
    });
    toast.showSuccess(t('roomsPage.create.created', { name: created.name }));
    emit('created', created);
  } catch {
    toast.showError(t('roomsPage.create.failed'));
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Modal :open="isOpen" size="md" @close="emit('close')">
    <template #header>{{ t('roomsPage.create.title') }}</template>
    <form
      id="create-room"
      class="flex flex-col gap-4 pt-1"
      novalidate
      @submit.prevent="submit"
    >
      <p class="m-0 text-body text-text-muted">
        {{ t('roomsPage.create.subtitle') }}
      </p>
      <FormField :label="t('roomsPage.create.name')" :error="nameError">
        <input
          v-model="name"
          type="text"
          maxlength="64"
          class="pulse-input"
          :placeholder="t('roomsPage.create.name_placeholder')"
        />
      </FormField>
      <RoomThresholdFields v-model="thresholds" />
    </form>
    <template #footer>
      <button
        type="submit"
        form="create-room"
        class="pulse-btn-primary"
        :disabled="submitting"
      >
        {{ t('roomsPage.create.submit') }}
      </button>
      <button type="button" class="pulse-btn-ghost" @click="emit('close')">
        {{ t('roomsPage.create.cancel') }}
      </button>
    </template>
  </Modal>
</template>
