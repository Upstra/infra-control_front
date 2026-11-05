<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormField, Callout } from '@/shared/components/pulse';
import ServerCredentials from '../../ServerCredentials.vue';
import { useServerSettings } from '../../../composables/useServerSettings';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import type { RoomResponseDto } from '@/features/rooms/types';
import type { Server } from '../../../types';

const props = defineProps<{
  server: Server;
  rooms: RoomResponseDto[];
  vmCount: number;
}>();
const emit = defineEmits<{ removed: [] }>();

const { t } = useI18n();
const upsLive = useUpsLiveStore();
const settings = useServerSettings(
  () => props.server,
  () => props.vmCount,
);
const { form, error, saving, confirmRemove, removeBlocked } = settings;
const showCredentials = ref(false);
const showIloCredentials = ref(false);

const upsOptions = computed(() =>
  [...upsLive.units].sort(
    (a, b) =>
      Number(b.roomId === form.value.roomId) -
        Number(a.roomId === form.value.roomId) || a.name.localeCompare(b.name),
  ),
);
const upsWarning = computed(() => {
  if (!form.value.upsId) return t('serversPage.settings.ups_missing');
  const ups = upsLive.byId[form.value.upsId];
  return ups && ups.roomId !== form.value.roomId
    ? t('serversPage.settings.ups_other_room')
    : null;
});
const errorText = (field: string) => {
  const current = error.value;
  if (!current) return null;
  const matches =
    current.startsWith(field) || (field === 'name' && current === 'duplicate');
  return matches ? t(`serversPage.settings.errors.${current}`) : null;
};
const remove = async () => {
  if (await settings.remove()) emit('removed');
};
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="settings.save">
    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5 gap-y-4"
    >
      <FormField
        :label="t('serversPage.settings.name')"
        :error="errorText('name')"
      >
        <input v-model="form.name" type="text" class="pulse-input font-mono" />
      </FormField>
      <FormField :label="t('serversPage.settings.ip')" :error="errorText('ip')">
        <input v-model="form.ip" type="text" class="pulse-input font-mono" />
      </FormField>
      <FormField
        :label="t('serversPage.settings.priority')"
        :hint="t('serversPage.settings.priority_hint')"
        :error="errorText('priority')"
      >
        <input
          v-model.number="form.priority"
          type="number"
          min="1"
          class="pulse-input font-mono"
        />
      </FormField>
      <FormField
        :label="t('serversPage.settings.room')"
        :error="errorText('room')"
      >
        <select v-model="form.roomId" class="pulse-input">
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </FormField>
      <FormField :label="t('serversPage.settings.ups')">
        <select v-model="form.upsId" class="pulse-input">
          <option :value="null">
            {{ t('serversPage.settings.ups_none') }}
          </option>
          <option v-for="ups in upsOptions" :key="ups.id" :value="ups.id">
            {{ ups.name }}
          </option>
        </select>
      </FormField>
    </div>
    <Callout v-if="upsWarning" tone="warning" :title="upsWarning" />
    <div class="grid gap-4 md:grid-cols-2">
      <div class="flex flex-col gap-2 rounded-md border border-border p-4">
        <div class="flex items-center">
          <span class="font-medium text-text-strong">{{
            t('serversPage.settings.credentials')
          }}</span>
          <button
            type="button"
            class="ml-auto text-caption font-medium text-primary-text"
            @click="showCredentials = !showCredentials"
          >
            {{
              showCredentials
                ? t('serversPage.settings.hide')
                : t('serversPage.settings.show')
            }}
          </button>
        </div>
        <ServerCredentials
          v-if="showCredentials"
          :login="server.login"
          :password="server.password"
        />
      </div>
      <div
        v-if="server.ilo"
        class="flex flex-col gap-2 rounded-md border border-border p-4"
      >
        <div class="flex items-center">
          <span class="font-medium text-text-strong">{{
            t('serversPage.settings.ilo_credentials')
          }}</span>
          <button
            type="button"
            class="ml-auto text-caption font-medium text-primary-text"
            @click="showIloCredentials = !showIloCredentials"
          >
            {{
              showIloCredentials
                ? t('serversPage.settings.hide')
                : t('serversPage.settings.show')
            }}
          </button>
        </div>
        <ServerCredentials
          v-if="showIloCredentials"
          :login="server.ilo.login"
          :password="server.ilo.password"
        />
      </div>
    </div>
    <Callout
      v-if="removeBlocked"
      tone="danger"
      :title="t('serversPage.settings.remove_blocked', { name: server.name })"
    />
    <div
      class="flex flex-wrap items-center gap-2.5 border-t border-surface-raised pt-5"
    >
      <button
        type="button"
        :class="confirmRemove ? 'pulse-btn-danger' : 'pulse-btn-danger-ghost'"
        data-action="remove"
        @click="remove"
      >
        {{
          confirmRemove
            ? t('serversPage.settings.remove_confirm')
            : t('serversPage.settings.remove')
        }}
      </button>
      <div class="flex-1" />
      <button type="button" class="pulse-btn-ghost" @click="settings.reset">
        {{ t('serversPage.settings.cancel') }}
      </button>
      <button type="submit" class="pulse-btn-primary" :disabled="saving">
        {{ t('serversPage.settings.save') }}
      </button>
    </div>
  </form>
</template>
