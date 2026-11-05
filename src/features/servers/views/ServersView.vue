<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import ServersPageHeader from '../components/page/ServersPageHeader.vue';
import ServersSummary from '../components/page/ServersSummary.vue';
import ServerList from '../components/list/ServerList.vue';
import ServerDetailPanel from '../components/detail/ServerDetailPanel.vue';
import ServerAddDrawer from '../components/add/ServerAddDrawer.vue';
import { useServersPage } from '../composables/useServersPage';

const { t } = useI18n();
const route = useRoute();
const page = useServersPage();
const {
  inventory,
  rooms,
  roomsById,
  query,
  filter,
  type,
  roomId,
  rows,
  visibleRows,
  summary,
  selectedId,
  selectedRow,
} = page;
const adding = ref(false);

onMounted(() => {
  if (route.query.add === '1') adding.value = true;
});

const inletWarnC = computed(() =>
  selectedRow.value
    ? roomsById.value[selectedRow.value.server.roomId]?.inletWarnC
    : null,
);

const onCreated = (id: string) => {
  adding.value = false;
  page.select(id);
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <ServersPageHeader @add="adding = true" />
    <ServersSummary :summary="summary" />
    <div class="flex flex-wrap items-start gap-5">
      <ServerList
        v-model:query="query"
        v-model:filter="filter"
        v-model:type="type"
        v-model:room-id="roomId"
        :rows="visibleRows"
        :total="rows.length"
        :selected-id="selectedId"
        :rooms="rooms"
        @select="page.select"
        @reset="page.resetFilters"
      />
      <ServerDetailPanel
        v-if="selectedRow"
        :row="selectedRow"
        :rooms="rooms"
        :inlet-warn-c="inletWarnC"
        @removed="$router.replace('/servers')"
      />
      <p
        v-else-if="inventory.loaded"
        class="m-0 flex-[999_1_560px] rounded-lg border border-dashed border-border-strong p-10 text-center text-text-muted"
      >
        {{ t('serversPage.detail.select') }}
      </p>
    </div>
    <ServerAddDrawer
      :open="adding"
      :rooms="rooms"
      @close="adding = false"
      @created="onCreated"
    />
  </div>
</template>
