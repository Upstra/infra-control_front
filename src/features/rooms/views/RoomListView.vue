<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus, Search } from 'lucide-vue-next';
import { SegmentedControl } from '@/shared/components/pulse';
import ConfirmModal from '@/shared/components/ConfirmModal.vue';
import RoomCard from '../components/RoomCard.vue';
import RoomCreateModal from '../components/RoomCreateModal.vue';
import { useRoomList } from '../composables/useRoomList';

const { t } = useI18n();
const list = useRoomList();
const {
  visible,
  rooms,
  loading,
  hasMore,
  query,
  creating,
  toDelete,
  viewMode,
  environments,
} = list;

const viewOptions = computed(() => [
  { value: 'grid' as const, label: t('roomsPage.grid') },
  { value: 'list' as const, label: t('roomsPage.list') },
]);
const viewModel = computed({
  get: () => viewMode.value,
  set: list.setViewMode,
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="m-0 text-display text-text-strong">
          {{ t('roomsPage.title') }}
        </h1>
        <span class="text-text-muted">{{ t('roomsPage.subtitle') }}</span>
      </div>
      <div class="flex-1" />
      <button type="button" class="pulse-btn-primary" @click="creating = true">
        <Plus class="h-4 w-4" aria-hidden="true" />{{ t('roomsPage.add') }}
      </button>
    </header>
    <div class="flex flex-wrap items-center gap-3">
      <label
        class="flex h-10 min-w-[240px] flex-1 items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-text-muted focus-within:border-primary-hover sm:max-w-md"
      >
        <Search class="h-4 w-4" aria-hidden="true" />
        <input
          v-model="query"
          type="search"
          :aria-label="t('roomsPage.search')"
          :placeholder="t('roomsPage.search')"
          class="min-w-0 flex-1 border-0 bg-transparent text-text-strong outline-none"
        />
      </label>
      <SegmentedControl
        v-model="viewModel"
        :options="viewOptions"
        :label="t('roomsPage.view')"
      />
    </div>
    <p
      v-if="!loading && !rooms.length"
      class="m-0 rounded-lg border border-dashed border-border-strong p-10 text-center text-text-muted"
    >
      {{ t('roomsPage.empty') }}
    </p>
    <p v-else-if="!visible.length && rooms.length" class="m-0 text-text-muted">
      {{ t('roomsPage.no_match') }}
    </p>
    <div
      :class="
        viewMode === 'grid'
          ? 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5'
          : 'flex flex-col gap-3'
      "
    >
      <RoomCard
        v-for="room in visible"
        :key="room.id"
        :room="room"
        :environment="environments.of(room.id)"
        :view-mode="viewMode"
        :can-delete="list.canDelete()"
        @delete="toDelete = $event"
      />
    </div>
    <button
      v-if="hasMore && !query"
      type="button"
      class="pulse-btn-ghost self-center"
      :disabled="loading"
      @click="list.loadMore"
    >
      {{ t('roomsPage.load_more') }}
    </button>
    <RoomCreateModal
      :is-open="creating"
      @close="creating = false"
      @created="list.onCreated"
    />
    <ConfirmModal
      :open="!!toDelete"
      :title="
        t('roomsPage.delete_confirm.title', { name: toDelete?.name ?? '' })
      "
      :message="t('roomsPage.delete_confirm.message')"
      :confirm-text="t('roomsPage.delete_confirm.confirm')"
      :cancel-text="t('roomsPage.delete_confirm.cancel')"
      variant="danger"
      @confirm="list.confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>
