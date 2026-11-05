<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormField, SideDrawer } from '@/shared/components/pulse';
import { useAddUps } from '../../composables/useAddUps';
import type { RoomResponseDto } from '@/features/rooms/types';

const props = defineProps<{ open: boolean; rooms: RoomResponseDto[] }>();
const emit = defineEmits<{ close: []; created: [id: string] }>();

const { t } = useI18n();
const { form, error, saving, reset, submit } = useAddUps();
const nominalInput = ref('');

watch(nominalInput, (value) => {
  form.value.nominalPowerW = value.trim() === '' ? null : Number(value);
});
watch(
  () => props.open,
  (open) => {
    if (!open) {
      reset();
      nominalInput.value = '';
    }
  },
);

const errorFor = (field: 'name' | 'ip' | 'room') => {
  const current = error.value;
  if (!current) return null;
  const owner = current === 'duplicate' ? 'name' : current.split('_')[0];
  return owner === field ? t(`upsPage.settings.errors.${current}`) : null;
};

const onSubmit = async () => {
  const created = await submit();
  if (created) emit('created', created.id);
};
</script>

<template>
  <SideDrawer
    :open="open"
    :title="t('upsPage.add_drawer.title')"
    :subtitle="t('upsPage.add_drawer.subtitle')"
    @close="emit('close')"
  >
    <form
      id="add-ups"
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="onSubmit"
    >
      <FormField :label="t('upsPage.settings.name')" :error="errorFor('name')">
        <input v-model="form.name" type="text" class="pulse-input" />
      </FormField>
      <FormField
        :label="t('upsPage.settings.ip')"
        :hint="t('upsPage.settings.ip_hint')"
        :error="errorFor('ip')"
      >
        <input v-model="form.ip" type="text" class="pulse-input font-mono" />
      </FormField>
      <FormField :label="t('upsPage.settings.room')" :error="errorFor('room')">
        <select v-model="form.roomId" class="pulse-input">
          <option value="" disabled>—</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </FormField>
      <FormField
        :label="t('upsPage.settings.grace_on')"
        :hint="t('upsPage.settings.grace_on_hint')"
      >
        <input
          v-model.number="form.gracePeriodOn"
          type="number"
          min="0"
          class="pulse-input font-mono"
        />
      </FormField>
      <FormField
        :label="t('upsPage.settings.grace_off')"
        :hint="t('upsPage.settings.grace_off_hint')"
      >
        <input
          v-model.number="form.gracePeriodOff"
          type="number"
          min="0"
          class="pulse-input font-mono"
        />
      </FormField>
      <FormField
        :label="t('upsPage.settings.nominal')"
        :hint="t('upsPage.settings.nominal_missing')"
      >
        <input
          v-model="nominalInput"
          type="number"
          min="1"
          class="pulse-input font-mono"
        />
      </FormField>
    </form>
    <template #footer>
      <button type="button" class="pulse-btn-ghost" @click="emit('close')">
        {{ t('upsPage.settings.cancel') }}
      </button>
      <button
        type="submit"
        form="add-ups"
        class="pulse-btn-primary"
        :disabled="saving"
      >
        {{ t('upsPage.add_drawer.submit') }}
      </button>
    </template>
  </SideDrawer>
</template>
