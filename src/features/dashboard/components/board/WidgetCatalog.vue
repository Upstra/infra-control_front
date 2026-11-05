<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SideDrawer } from '@/shared/components/pulse';
import { CATALOG_ORDER, type PulseWidgetType } from '../../domain/catalog';
import { CATALOG_ICONS } from './catalogIcons';

const props = defineProps<{
  open: boolean;
  boardName: string;
  present: Set<PulseWidgetType>;
}>();

const emit = defineEmits<{ close: []; add: [type: PulseWidgetType] }>();

const { t } = useI18n();

const items = computed(() =>
  CATALOG_ORDER.map((type) => ({
    type,
    icon: CATALOG_ICONS[type],
    label: t(`widgets.types.${type}.label`),
    desc: t(`widgets.types.${type}.desc`),
    disabled: props.present.has(type),
  })),
);
</script>

<template>
  <SideDrawer
    :open="open"
    :title="t('boards.catalog.title')"
    :subtitle="t('boards.catalog.subtitle', { name: boardName })"
    :width="420"
    @close="emit('close')"
  >
    <button
      v-for="item in items"
      :key="item.type"
      type="button"
      :disabled="item.disabled"
      :data-type="item.type"
      class="pulse-press flex w-full items-center gap-3.5 rounded-[14px] border border-border p-3.5 text-left enabled:hover:border-border-strong enabled:hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60"
      @click="emit('add', item.type)"
    >
      <span
        class="grid h-10 w-10 flex-none place-items-center rounded-md border border-border bg-surface-raised text-primary-text"
      >
        <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="font-medium text-text-strong">{{ item.label }}</span>
        <span class="text-caption text-text-muted">{{ item.desc }}</span>
      </span>
      <span
        :class="[
          'flex-none font-mono text-overline',
          item.disabled ? 'text-text-faint' : 'text-primary-text',
        ]"
        data-part="status"
        >{{
          item.disabled ? t('boards.catalog.present') : t('boards.catalog.add')
        }}</span
      >
    </button>
  </SideDrawer>
</template>
