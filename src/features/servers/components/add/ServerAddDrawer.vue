<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  FormField,
  SegmentedControl,
  SideDrawer,
} from '@/shared/components/pulse';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
import { useAddServer } from '../../composables/useAddServer';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import type { RoomResponseDto } from '@/features/rooms/types';
import type { ServerType } from '../../types';

const props = defineProps<{ open: boolean; rooms: RoomResponseDto[] }>();
const emit = defineEmits<{ close: []; created: [id: string] }>();

const { t } = useI18n();
const upsLive = useUpsLiveStore();
const { form, error, saving, reset, submit } = useAddServer();

watch(
  () => props.open,
  (open) => {
    if (!open) reset();
  },
);

const types = computed(() => [
  { value: 'esxi' as ServerType, label: t('serversPage.add_drawer.esxi') },
  {
    value: 'vcenter' as ServerType,
    label: t('serversPage.add_drawer.vcenter'),
  },
]);
const upsOptions = computed(() =>
  upsLive.units.filter(
    (ups) => !form.value.roomId || ups.roomId === form.value.roomId,
  ),
);
const errorFor = (field: string) => {
  const current = error.value;
  if (!current) return null;
  const owner =
    current === 'duplicate'
      ? 'name'
      : current.replace(/_(required|invalid)$/, '');
  return owner === field ? t(`serversPage.settings.errors.${current}`) : null;
};

const onSubmit = async () => {
  const created = await submit();
  if (created) emit('created', created.id);
};
</script>

<template>
  <SideDrawer
    :open="open"
    :title="t('serversPage.add_drawer.title')"
    :subtitle="t('serversPage.add_drawer.subtitle')"
    @close="emit('close')"
  >
    <form
      id="add-server"
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="onSubmit"
    >
      <FormField :label="t('serversPage.add_drawer.type')" tag="div">
        <SegmentedControl
          v-model="form.type"
          :options="types"
          :label="t('serversPage.add_drawer.type')"
        />
      </FormField>
      <FormField
        :label="t('serversPage.settings.name')"
        :error="errorFor('name')"
      >
        <input v-model="form.name" type="text" class="pulse-input font-mono" />
      </FormField>
      <FormField :label="t('serversPage.settings.ip')" :error="errorFor('ip')">
        <input v-model="form.ip" type="text" class="pulse-input font-mono" />
      </FormField>
      <FormField :label="t('serversPage.add_drawer.admin_url')">
        <input
          v-model="form.adminUrl"
          type="url"
          class="pulse-input font-mono"
          :placeholder="form.ip ? `https://${form.ip}` : ''"
        />
      </FormField>
      <div class="grid grid-cols-2 gap-3">
        <FormField
          :label="t('serversPage.add_drawer.login')"
          :error="errorFor('login')"
        >
          <input
            v-model="form.login"
            type="text"
            autocomplete="off"
            class="pulse-input font-mono"
          />
        </FormField>
        <FormField
          :label="t('serversPage.add_drawer.password')"
          :error="errorFor('password')"
        >
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="pulse-input font-mono"
          />
        </FormField>
      </div>
      <FormField
        :label="t('serversPage.settings.room')"
        :error="errorFor('room')"
      >
        <select v-model="form.roomId" class="pulse-input">
          <option value="" disabled>—</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </FormField>
      <FormField :label="t('serversPage.settings.ups')">
        <select v-model="form.upsId" class="pulse-input">
          <option value="">{{ t('serversPage.settings.ups_none') }}</option>
          <option v-for="ups in upsOptions" :key="ups.id" :value="ups.id">
            {{ ups.name }}
          </option>
        </select>
      </FormField>
      <FormField
        :label="t('serversPage.settings.priority')"
        :hint="t('serversPage.settings.priority_hint')"
        :error="errorFor('priority')"
      >
        <input
          v-model.number="form.priority"
          type="number"
          min="1"
          class="pulse-input font-mono"
        />
      </FormField>
      <div class="flex items-center gap-3 border-t border-border pt-4">
        <ToggleSwitch
          v-model="form.withIlo"
          :aria-label="t('serversPage.add_drawer.ilo')"
        />
        <span class="font-medium text-text-strong">{{
          t('serversPage.add_drawer.ilo')
        }}</span>
      </div>
      <template v-if="form.withIlo">
        <FormField :label="t('serversPage.add_drawer.ilo_name')">
          <input
            v-model="form.iloName"
            type="text"
            class="pulse-input font-mono"
          />
        </FormField>
        <FormField
          :label="t('serversPage.add_drawer.ilo_ip')"
          :error="errorFor('ilo_ip')"
        >
          <input
            v-model="form.iloIp"
            type="text"
            class="pulse-input font-mono"
          />
        </FormField>
        <div class="grid grid-cols-2 gap-3">
          <FormField :label="t('serversPage.add_drawer.login')">
            <input
              v-model="form.iloLogin"
              type="text"
              autocomplete="off"
              class="pulse-input font-mono"
            />
          </FormField>
          <FormField :label="t('serversPage.add_drawer.password')">
            <input
              v-model="form.iloPassword"
              type="password"
              autocomplete="new-password"
              class="pulse-input font-mono"
            />
          </FormField>
        </div>
      </template>
    </form>
    <template #footer>
      <button type="button" class="pulse-btn-ghost" @click="emit('close')">
        {{ t('serversPage.settings.cancel') }}
      </button>
      <button
        type="submit"
        form="add-server"
        class="pulse-btn-primary"
        :disabled="saving"
      >
        {{ t('serversPage.add_drawer.submit') }}
      </button>
    </template>
  </SideDrawer>
</template>
