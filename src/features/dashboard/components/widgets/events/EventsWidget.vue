<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import FeedEntry from './FeedEntry.vue';
import { dataState } from '../shared/dataState';
import { useFeedStore } from '@/features/events/store';

const VISIBLE = 7;

const { t } = useI18n();
const feed = useFeedStore();

onMounted(() => feed.start());

const items = computed(() => feed.items.slice(0, VISIBLE));
const state = computed(() => dataState(feed, items.value.length === 0));
</script>

<template>
  <WidgetCard
    :title="t('widgets.types.events.label')"
    :meta="String(feed.items.length)"
  >
    <template #actions>
      <router-link to="/admin/history" class="font-medium text-primary-text">{{
        t('widgets.events.history')
      }}</router-link>
    </template>
    <WidgetStatus
      :state="state"
      :stale="feed.stale"
      :empty-text="t('widgets.events.empty')"
      @retry="feed.load"
    >
      <TransitionGroup
        tag="ol"
        name="feed"
        class="m-0 flex list-none flex-col p-0"
      >
        <FeedEntry
          v-for="(item, index) in items"
          :key="item.id"
          :item="item"
          :last="index === items.length - 1"
        />
      </TransitionGroup>
    </WidgetStatus>
  </WidgetCard>
</template>

<style scoped>
.feed-enter-active {
  animation: pulse-slide-in 0.5s var(--ease-pulse);
}
</style>
