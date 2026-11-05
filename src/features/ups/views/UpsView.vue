<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import UpsPageHeader from '../components/page/UpsPageHeader.vue';
import UpsSummaryBar from '../components/page/UpsSummaryBar.vue';
import UpsList from '../components/list/UpsList.vue';
import UpsDetailPanel from '../components/detail/UpsDetailPanel.vue';
import UpsAddDrawer from '../components/add/UpsAddDrawer.vue';
import { useUpsPage } from '../composables/useUpsPage';
import { useRoomOptions } from '@/features/rooms/composables/useRoomOptions';

const { t } = useI18n();
const page = useUpsPage();
const {
  live,
  query,
  filter,
  roomId,
  rows,
  visibleRows,
  summary,
  selected,
  selectedRow,
  selectedId,
} = page;
const { rooms, nameOf } = useRoomOptions();
const adding = ref(false);

const status = computed(() =>
  selected.value ? (live.statusById[selected.value.id] ?? null) : null,
);
const roomName = (id: string) => nameOf(id);

const onCreated = (id: string) => {
  adding.value = false;
  page.select(id);
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <UpsPageHeader @add="adding = true" />
    <UpsSummaryBar :summary="summary" />
    <div class="flex flex-wrap items-start gap-5">
      <UpsList
        v-model:query="query"
        v-model:filter="filter"
        v-model:room-id="roomId"
        :rows="visibleRows"
        :total="rows.length"
        :selected-id="selectedId"
        :rooms="rooms"
        :room-name="roomName"
        @select="page.select"
        @reset="page.resetFilters"
      />
      <UpsDetailPanel
        v-if="selected && selectedRow"
        :ups="selected"
        :row="selectedRow"
        :status="status"
        :rooms="rooms"
        :room-name="roomName"
        @deleted="$router.replace('/ups')"
      />
      <p
        v-else-if="live.loaded"
        class="m-0 flex-[999_1_560px] rounded-lg border border-dashed border-border-strong p-10 text-center text-text-muted"
      >
        {{ t('upsPage.detail.select') }}
      </p>
    </div>
    <UpsAddDrawer
      :open="adding"
      :rooms="rooms"
      @close="adding = false"
      @created="onCreated"
    />
  </div>
</template>
