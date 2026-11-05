<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import UpsMiniCard from './UpsMiniCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import { dataState } from '../shared/dataState';
import { sortUpsCards, upsCardModel } from '../../../domain/upsCard';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import { useAlertsStore } from '@/features/alerts/store';

const { t } = useI18n();
const upsLive = useUpsLiveStore();
const alerts = useAlertsStore();

onMounted(() => upsLive.start());

const unreachableIds = computed(
  () =>
    new Set(
      alerts.open
        .filter((alert) => alert.type === 'ups_unreachable')
        .map((alert) => alert.resourceId),
    ),
);

const cards = computed(() =>
  sortUpsCards(
    upsLive.units.map((ups) =>
      upsCardModel(
        ups,
        upsLive.statusById[ups.id] ?? null,
        unreachableIds.value.has(ups.id),
      ),
    ),
  ),
);

const state = computed(() => dataState(upsLive, cards.value.length === 0));
</script>

<template>
  <section
    :aria-label="t('widgets.types.ups.label')"
    class="flex flex-col gap-4"
  >
    <div class="flex items-center gap-3">
      <h2 class="m-0 text-title text-text-strong">
        {{ t('widgets.types.ups.label') }}
      </h2>
      <span class="font-mono text-overline text-text-muted tnum">{{
        upsLive.units.length
      }}</span>
      <div class="flex-1" />
      <router-link to="/ups" class="font-medium text-primary-text">{{
        t('widgets.ups.all')
      }}</router-link>
    </div>
    <WidgetStatus
      :state="state"
      :stale="upsLive.stale"
      :empty-text="t('widgets.ups.empty')"
      @retry="upsLive.load"
    >
      <div class="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
        <UpsMiniCard v-for="card in cards" :key="card.id" :card="card" />
      </div>
    </WidgetStatus>
  </section>
</template>
