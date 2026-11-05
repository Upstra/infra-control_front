<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { TriangleAlert } from 'lucide-vue-next';

defineProps<{
  upsName: string;
  from: string;
  to: string;
  serverNames: string[];
}>();

const moveServers = defineModel<boolean>({ required: true });
const { t } = useI18n();
</script>

<template>
  <div
    class="pulse-swap flex flex-col gap-3 rounded-[14px] border border-warning/40 bg-warning-surface px-[18px] py-4"
  >
    <div class="flex items-start gap-3">
      <TriangleAlert
        class="mt-px h-[18px] w-[18px] flex-none text-warning"
        aria-hidden="true"
      />
      <div class="flex flex-col gap-1">
        <span class="font-medium text-text-strong">{{
          t('upsPage.settings.move_title', { name: upsName, from, to })
        }}</span>
        <span class="text-text">{{
          serverNames.length
            ? t(
                'upsPage.settings.move_text',
                {
                  count: serverNames.length,
                  names: serverNames.join(', '),
                  from,
                },
                serverNames.length,
              )
            : t('upsPage.settings.move_none')
        }}</span>
      </div>
    </div>
    <div
      v-if="serverNames.length"
      role="radiogroup"
      :aria-label="t('upsPage.settings.move_group')"
      class="flex flex-col gap-2 pl-[30px]"
    >
      <button
        v-for="option in [true, false]"
        :key="String(option)"
        type="button"
        role="radio"
        :aria-checked="moveServers === option"
        :class="[
          'flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-text-strong',
          moveServers === option
            ? 'border-border-strong bg-surface-raised'
            : 'border-transparent hover:bg-surface-raised',
        ]"
        :data-move="option"
        @click="moveServers = option"
      >
        <span
          :class="[
            'h-3.5 w-3.5 flex-none rounded-full',
            moveServers === option
              ? 'border-4 border-primary-hover'
              : 'border-[1.5px] border-text-faint',
          ]"
        />
        {{
          option
            ? t('upsPage.settings.move_yes', { count: serverNames.length, to })
            : t('upsPage.settings.move_no', { from })
        }}
      </button>
    </div>
  </div>
</template>
