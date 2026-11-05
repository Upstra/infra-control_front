<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import PresenceEntry from './PresenceEntry.vue';
import { dataState } from '../shared/dataState';
import { usePresenceStore } from '@/features/presence/store';
import { useUserDirectory } from '@/features/presence/composables/useUserDirectory';
import { sortPresence } from '@/features/presence/domain/entry';
import { useAuthStore } from '@/features/auth/store';

const { t } = useI18n();
const presence = usePresenceStore();
const auth = useAuthStore();
const { byId } = useUserDirectory();

const selfId = computed(() => auth.currentUser?.id ?? null);
const views = computed(() => sortPresence(presence.online, selfId.value));
const nameOf = (userId: string) =>
  byId.value[userId]?.username ??
  (userId === selfId.value ? auth.currentUser?.username : null) ??
  t('widgets.presence.unknown_user');
const state = computed(() => dataState(presence, views.value.length === 0));
</script>

<template>
  <WidgetCard
    :title="t('widgets.types.presence.label')"
    :meta="String(views.length)"
  >
    <WidgetStatus
      :state="state"
      :empty-text="t('widgets.presence.empty')"
      @retry="presence.load"
    >
      <ul class="m-0 flex list-none flex-col gap-3.5 p-0">
        <PresenceEntry
          v-for="view in views"
          :key="view.userId"
          :view="view"
          :name="nameOf(view.userId)"
          :self="view.userId === selfId"
        />
      </ul>
    </WidgetStatus>
  </WidgetCard>
</template>
