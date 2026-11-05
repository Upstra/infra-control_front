<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search } from 'lucide-vue-next';
import { SegmentedControl } from '@/shared/components/pulse';
import ServerListRow from './ServerListRow.vue';
import type { ServerFilter, ServerRowModel } from '../../domain/row';
import type { ServerType } from '../../types';
import type { RoomResponseDto } from '@/features/rooms/types';

defineProps<{
  rows: ServerRowModel[];
  total: number;
  selectedId: string | null;
  rooms: RoomResponseDto[];
}>();

const query = defineModel<string>('query', { required: true });
const filter = defineModel<ServerFilter>('filter', { required: true });
const type = defineModel<ServerType | null>('type', { required: true });
const roomId = defineModel<string | null>('roomId', { required: true });

const emit = defineEmits<{ select: [id: string]; reset: [] }>();
const { t } = useI18n();

const filterOptions = computed(() => [
  { value: 'all' as const, label: t('serversPage.list.all') },
  { value: 'issues' as const, label: t('serversPage.list.issues') },
]);
</script>

<template>
  <section
    :aria-label="t('serversPage.list.region')"
    class="flex min-w-0 flex-[1_1_380px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm lg:max-w-[460px]"
  >
    <div class="flex flex-col gap-3 p-4">
      <label
        class="flex h-10 items-center gap-2.5 rounded-md border border-border bg-surface-sunken px-3.5 text-text-muted focus-within:border-primary-hover"
      >
        <Search class="h-4 w-4" aria-hidden="true" />
        <input
          v-model="query"
          type="search"
          :placeholder="t('serversPage.list.search')"
          :aria-label="t('serversPage.list.search_aria')"
          class="min-w-0 flex-1 border-0 bg-transparent text-text-strong outline-none"
        />
      </label>
      <div class="flex flex-wrap gap-2">
        <SegmentedControl
          v-model="filter"
          :options="filterOptions"
          :label="t('serversPage.list.state_filter')"
        />
        <select
          v-model="type"
          :aria-label="t('serversPage.list.type_filter')"
          class="h-10 rounded-full border border-border bg-surface-sunken px-3 text-caption text-text"
        >
          <option :value="null">{{ t('serversPage.list.all_types') }}</option>
          <option value="esxi">ESXi</option>
          <option value="vcenter">vCenter</option>
        </select>
        <select
          v-model="roomId"
          :aria-label="t('serversPage.list.room_filter')"
          class="h-10 rounded-full border border-border bg-surface-sunken px-3 text-caption text-text"
        >
          <option :value="null">{{ t('serversPage.list.all_rooms') }}</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex flex-col border-t border-surface-raised">
      <ServerListRow
        v-for="row in rows"
        :key="row.server.id"
        :row="row"
        :selected="row.server.id === selectedId"
        @select="emit('select', row.server.id)"
      />
      <p v-if="!total" class="m-0 px-4 py-8 text-center text-text-muted">
        {{ t('serversPage.list.none') }}
      </p>
      <p
        v-else-if="!rows.length"
        class="m-0 px-4 py-8 text-center text-text-muted"
      >
        {{ t('serversPage.list.empty') }}
        <button
          type="button"
          class="font-medium text-primary-text"
          @click="emit('reset')"
        >
          {{ t('serversPage.list.reset') }}
        </button>
      </p>
    </div>
  </section>
</template>
