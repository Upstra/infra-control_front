<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormField } from '@/shared/components/pulse';
import RoomMoveChoice from './RoomMoveChoice.vue';
import { useUpsSettings } from '../../../composables/useUpsSettings';
import { fmt } from '@/shared/utils/fmt';
import type { RoomResponseDto } from '@/features/rooms/types';
import type { Server } from '@/features/servers/types';
import type { UpsResponseDto } from '../../../types';

const props = defineProps<{
  ups: UpsResponseDto;
  servers: Server[];
  rooms: RoomResponseDto[];
  roomName: (id: string) => string | null;
}>();

const emit = defineEmits<{ deleted: [] }>();

const { t } = useI18n();
const settings = useUpsSettings(
  () => props.ups,
  () => props.servers,
);
const { form, error, saving, confirmDelete, roomMoved } = settings;
const nominalInput = ref(props.ups.nominalPowerW?.toString() ?? '');

watch(
  () => props.ups.id,
  () => {
    nominalInput.value = props.ups.nominalPowerW?.toString() ?? '';
  },
);
watch(nominalInput, (value) => {
  form.value.nominalPowerW = value.trim() === '' ? null : Number(value);
});

const nominalHint = computed(() =>
  props.ups.nominalPowerSource === 'device' && props.ups.effectiveNominalPowerW
    ? t('upsPage.settings.nominal_device', {
        watts: fmt.value(props.ups.effectiveNominalPowerW, 'W'),
      })
    : t('upsPage.settings.nominal_missing'),
);
const errorText = (field: string) =>
  error.value && error.value.startsWith(field)
    ? t(`upsPage.settings.errors.${error.value}`)
    : null;

const remove = async () => {
  if (await settings.remove()) emit('deleted');
};
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="settings.save">
    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5 gap-y-4"
    >
      <FormField :label="t('upsPage.settings.name')" :error="errorText('name')">
        <input v-model="form.name" type="text" class="pulse-input" required />
      </FormField>
      <FormField
        :label="t('upsPage.settings.ip')"
        :hint="t('upsPage.settings.ip_hint')"
        :error="errorText('ip')"
      >
        <input
          v-model="form.ip"
          type="text"
          class="pulse-input font-mono"
          required
        />
      </FormField>
      <FormField
        :label="t('upsPage.settings.room')"
        :hint="t('upsPage.settings.room_hint')"
      >
        <select v-model="form.roomId" class="pulse-input">
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{
              room.id === ups.roomId
                ? t('upsPage.settings.room_current', { name: room.name })
                : room.name
            }}
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
        :hint="nominalHint"
        :error="errorText('nominal')"
      >
        <input
          v-model="nominalInput"
          type="number"
          min="1"
          max="1000000"
          class="pulse-input font-mono"
        />
      </FormField>
    </div>
    <RoomMoveChoice
      v-if="roomMoved"
      v-model="form.moveServers"
      :ups-name="ups.name"
      :from="roomName(ups.roomId) ?? ''"
      :to="roomName(form.roomId) ?? ''"
      :server-names="servers.map((server) => server.name)"
    />
    <div
      class="flex flex-wrap items-center gap-2.5 border-t border-surface-raised pt-5"
    >
      <button
        type="button"
        :class="confirmDelete ? 'pulse-btn-danger' : 'pulse-btn-danger-ghost'"
        data-action="delete"
        @click="remove"
      >
        {{
          confirmDelete
            ? t('upsPage.settings.delete_confirm')
            : t('upsPage.settings.delete')
        }}
      </button>
      <div class="flex-1" />
      <button type="button" class="pulse-btn-ghost" @click="settings.reset">
        {{ t('upsPage.settings.cancel') }}
      </button>
      <button type="submit" class="pulse-btn-primary" :disabled="saving">
        {{ t('upsPage.settings.save') }}
      </button>
    </div>
  </form>
</template>
